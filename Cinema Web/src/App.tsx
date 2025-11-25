import { useState, useMemo, useEffect, useCallback } from "react";
import { MovieHero } from "./components/MovieHero";
import { MovieCard } from "./components/MovieCard";
import { SeatSelection } from "./components/SeatSelection";
import { SnackBar } from "./components/SnackBar";
import { FilterBar } from "./components/FilterBar";
import { ReviewSection } from "./components/ReviewSection";
import { PromoSection } from "./components/PromoSection";
import { UserProfile } from "./components/UserProfile";
import { Auth } from "./components/Auth";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent } from "./components/ui/dialog";
import { Separator } from "./components/ui/separator";
import { 
  Film, MapPin, Clock, Calendar, CheckCircle, Star, User as UserIcon,
  Ticket, Award, Mail, Phone, ChevronRight, Play, Info, Share2, LogOut
} from "lucide-react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Movie, Showtime, Seat, CartItem, User, Booking, Review, SnackItem, Promo } from "./types";
import { saveBooking } from "./components/database";
import { toast, Toaster } from "sonner@2.0.3";
import { movies as moviesData } from "./data/movies";
import { snacks as snacksData } from "./data/snacks";
import { promos as promosData } from "./data/promos";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

const showtimes: Showtime[] = [ { id: "1", movieId: "1", time: "10:30 AM", date: "Nov 7", screen: "Screen 1", screenType: "Standard", price: 12, availableSeats: 45 }, { id: "2", movieId: "1", time: "1:45 PM", date: "Nov 7", screen: "Screen 2", screenType: "IMAX", price: 18, availableSeats: 32 }, { id: "3", movieId: "1", time: "4:20 PM", date: "Nov 7", screen: "Screen 3", screenType: "3D", price: 15, availableSeats: 28 }, { id: "4", movieId: "1", time: "7:00 PM", date: "Nov 7", screen: "Screen 1", screenType: "Standard", price: 12, availableSeats: 52 }, { id: "5", movieId: "1", time: "9:30 PM", date: "Nov 7", screen: "Screen 4", screenType: "4DX", price: 22, availableSeats: 18 }, ];

type View = "home" | "browse" | "movie-details" | "seat-selection" | "snacks" | "checkout" | "confirmation" | "profile" | "promos" | "theaters";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [snackCart, setSnackCart] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [moviesState, setMoviesState] = useState<Movie[]>(moviesData);
  const [snacksState, setSnacksState] = useState<SnackItem[]>(snacksData);
  const [promosState, setPromosState] = useState<Promo[]>(promosData);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  const [movieDetailsTab, setMovieDetailsTab] = useState("overview");
 
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popular");

  // Define isLoading como falso, pois os dados agora são locais e carregam instantaneamente.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Observador de estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged disparado. Usuário:", firebaseUser);
      if (firebaseUser) {
        // Usuário logado. Vamos buscar seus dados no Firestore.
        // Adicionamos uma lógica de nova tentativa para resolver a condição de corrida do cadastro.
        const fetchUserData = async (retries = 3) => {
          console.log(`Tentando buscar dados do usuário... Tentativas restantes: ${retries}`);
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
 
          if (userDocSnap.exists()) {
            console.log("Documento do usuário encontrado:", userDocSnap.data());
            setUser({ id: firebaseUser.uid, ...userDocSnap.data() } as User);
            setIsAuthChecked(true); // Autenticação verificada
          } else if (retries > 0) {
            // Se o documento não existe, espera um pouco e tenta de novo.
            console.warn("Documento do usuário ainda não encontrado. Tentando novamente em 1 segundo...");
            setTimeout(() => fetchUserData(retries - 1), 1000);
          } else {
            console.error("Não foi possível encontrar os dados do usuário no Firestore após várias tentativas.");
            setIsAuthChecked(true); // Para de verificar mesmo se der erro
          }
        };
        fetchUserData();
      } else {
        // O usuário está deslogado.
        setUser(null);
        setIsAuthChecked(true); // Autenticação verificada (sem usuário)
        console.log("Nenhum usuário logado.");
      }
    });
    return () => unsubscribe(); // Limpa o observador ao desmontar
  }, []);

  // Filtered and sorted movies
  const filteredMovies = useMemo(() => {
    let filtered = moviesState;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genre.some(g => selectedGenres.includes(g))
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      default: // popular
        sorted.sort((a, b) => b.totalReviews - a.totalReviews);
    }

    return sorted;
  }, [moviesState, searchTerm, selectedGenres, sortBy]);

  const handleLogout = async () => {
    await signOut(auth);
    // O observador onAuthStateChanged cuidará de limpar o estado do usuário.
    toast.success("Logout realizado com sucesso!");
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView("movie-details");
    setMovieDetailsTab("overview"); // Reseta para a aba principal ao abrir um novo filme
    window.scrollTo(0, 0);
  };

  const handleShowtimeSelect = (showtime: Showtime) => {
    if (!user) {
      toast.error("Faça login para reservar ingressos");
      return;
    }
    setSelectedShowtime(showtime);
    setCurrentView("seat-selection");
    window.scrollTo(0, 0);
  };

  const handleSeatConfirm = (seats: Seat[]) => {
    setSelectedSeats(seats);
    setCurrentView("snacks");
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (item: typeof snacks[0], size?: string) => {
    setSnackCart(prev => {
      const existing = prev.find(c => c.item.id === item.id && c.size === size);
      if (existing) {
        return prev.map(c =>
          c.item.id === item.id && c.size === size
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { item, quantity: 1, size }];
    });
    toast.success(`${item.name} adicionado ao carrinho`);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setSnackCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setSnackCart(prev =>
      prev.map(c => (c.item.id === itemId ? { ...c, quantity } : c))
    );
  };

  const handleApplyPromo = (code: string) => {
    const promo = promosState.find(p => p.code === code);
    if (promo) {
      setAppliedPromo(code);
      toast.success(`Desconto ${code} aplicado! ${promo.discount}% desconto`);
    } else {
      toast.error("Desconto Inválido");
    }
  };

  const handleAddReview = (rating: number, comment: string) => {
    if (!selectedMovie) return;
    
    const newReview: Review = {
      id: `r${Date.now()}`,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      date: "Agora mesmo",
      likes: 0
    };

    setMoviesState(prev =>
      prev.map(m =>
        m.id === selectedMovie.id
          ? {
              ...m,
              reviews: [newReview, ...m.reviews],
              totalReviews: m.totalReviews + 1,
              averageRating: ((m.averageRating * m.totalReviews) + rating) / (m.totalReviews + 1)
            }
          : m
      )
    );

    setSelectedMovie(prev =>
      prev
        ? {
            ...prev,
            reviews: [newReview, ...prev.reviews],
            totalReviews: prev.totalReviews + 1,
            averageRating: ((prev.averageRating * prev.totalReviews) + rating) / (prev.totalReviews + 1)
          }
        : null
    );

    toast.success("Avaliação adicionada com sucesso!");
  };

  const calculateTotal = () => {
    const seatsTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const snacksTotal = snackCart.reduce((sum, item) => {
      let price = item.item.price;
      if (item.size === "Medium") price *= 1.5;
      if (item.size === "Large") price *= 2;
      return sum + price * item.quantity;
    }, 0);
    
    let total = seatsTotal + snacksTotal;
    
    if (appliedPromo) {
      const promo = promosState.find(p => p.code === appliedPromo);
      if (promo && total >= promo.minPurchase) {
        total = total * (1 - promo.discount / 100);
      }
    }
    
    return { seatsTotal, snacksTotal, total };
  };

  const handleCheckout = () => {
    setCurrentView("checkout");
    window.scrollTo(0, 0);
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedMovie || !selectedShowtime) {
      toast.error("Erro: Informações da sessão ou do filme estão faltando.");
      return;
    }

    const promise = async () => {
      const { total } = calculateTotal();
      const bookingDetails = {
        movieTitle: selectedMovie.title,
        movieId: selectedMovie.id,
        showtime: `${selectedShowtime.date} at ${selectedShowtime.time}`,
        seats: selectedSeats,
        snacks: snackCart.map(c => ({ id: c.item.id, name: c.item.name, quantity: c.quantity, price: c.item.price, size: c.size })),
        total: total,
      };

      // 1. Salva a compra no banco de dados usando a função que criamos.
      await saveBooking(user.id, bookingDetails);

      // 2. Atualiza o estado local do usuário de forma segura.
      const pointsEarned = Math.floor(total);
      setUser(currentUser => {
        if (!currentUser) return null;
        const newBooking: Booking = {
          id: `b${Date.now()}`,
          movieId: selectedMovie.id,
          movieTitle: selectedMovie.title,
          showtime: `${selectedShowtime.date} at ${selectedShowtime.time} - ${selectedShowtime.screen}`,
          seats: selectedSeats.map(s => s.id),
          snacks: snackCart,
          total,
          date: new Date().toLocaleDateString(),
          status: "confirmado",
          pointsEarned,
        };
        return {
          ...currentUser,
          loyaltyPoints: (currentUser.loyaltyPoints || 0) + pointsEarned,
          bookings: [newBooking, ...(currentUser.bookings || [])],
        };
      });
    };

    toast.promise(promise(), {
      loading: "Confirmando sua compra...",
      success: () => {
        setCurrentView("confirmation");
        window.scrollTo(0, 0);
        return "Compra realizada com sucesso!";
      },
      error: "Falha ao confirmar a compra. Tente novamente.",
    });
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSnackCart([]);
    setAppliedPromo(null);
    window.scrollTo(0, 0);
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Mostra a tela de carregamento enquanto os dados dos filmes E a verificação inicial de autenticação não estiverem concluídos.
  if (isLoading || !isAuthChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Film className="w-16 h-16 text-red-600 animate-spin" />
        <p className="ml-4 text-lg">Carregando...</p>
      </div>
    );
  }

  // Declarar estas constantes APÓS a verificação de carregamento para garantir que `moviesState` não esteja vazio.
  const featuredMovie = moviesState[0];
  const trendingMovies = moviesState.slice(0, 4);
  const comingSoon = moviesState.slice(4, 8);

  // Show Auth screen if not authenticated
  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <Auth />
      </>
    );
  }

  // Seat Selection View
  if (currentView === "seat-selection" && selectedMovie && selectedShowtime) {
    return (
      <>
        <Toaster position="top-center" />
        <SeatSelection
          movieTitle={selectedMovie.title}
          showtime={`${selectedShowtime.date} at ${selectedShowtime.time} - ${selectedShowtime.screen}`}
          screenType={selectedShowtime.screenType}
          onConfirm={handleSeatConfirm}
          onBack={() => setCurrentView("movie-details")}
        />
      </>
    );
  }

  // Snacks View
  if (currentView === "snacks" && selectedMovie && selectedShowtime) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        <Header 
          user={user} 
          onProfileClick={() => setCurrentView("profile")}
          onLogout={handleLogout}
        />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setCurrentView("seat-selection")} className="mb-6">
            ← Voltar para Assentos
          </Button>

          <SnackBar
            snacks={snacksState}
            cart={snackCart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart} // TODO: Translate SnackBar component
            onUpdateQuantity={handleUpdateQuantity}
          />

          <div className="flex justify-end mt-8 gap-4">
            <Button variant="outline" onClick={handleCheckout}> 
              Pular Snacks
            </Button>
            <Button size="lg" onClick={handleCheckout}>
              Continuar para o Checkout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Checkout View
  if (currentView === "checkout") {
    const { seatsTotal, snacksTotal, total } = calculateTotal();
    const discount = appliedPromo
      ? promosState.find(p => p.code === appliedPromo)?.discount || 0
      : 0;

    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" />
        <Header 
          user={user} 
          onProfileClick={() => setCurrentView("profile")}
          onLogout={handleLogout}
        />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setCurrentView("snacks")} className="mb-6">
            ← Voltar
          </Button>

          <h1 className="mb-8">Finalizar Pedido</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Movie Info */}
              <Card className="p-6">
                <h2 className="mb-4">Detalhes da Reserva</h2>
                <div className="flex gap-4">
                  <img
                    src={selectedMovie!.poster}
                    alt={selectedMovie!.title}
                    className="w-24 h-36 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="mb-2">{selectedMovie!.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {selectedShowtime!.date} at {selectedShowtime!.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedShowtime!.screen} - {selectedShowtime!.screenType}
                      </p>
                      <p className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        Assentos: {selectedSeats.map(s => s.id).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact Info */}
              <Card className="p-6">
                <h2 className="mb-4">Informações de Contato</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm mb-2 block">Email</label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Telefone</label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-4">
                <h2 className="mb-4">Resumo do Pedido</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Ingressos</p>
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="flex justify-between text-sm mb-1">
                        <span>{seat.id} - {seat.type}</span>
                        <span>${seat.price}</span>
                      </div>
                    ))}
                  </div>

                  {snackCart.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Snacks</p>
                        {snackCart.map(item => (
                          <div key={item.item.id} className="flex justify-between text-sm mb-1">
                            <span>
                              {item.quantity}x {item.item.name}
                              {item.size && ` (${item.size})`}
                            </span>
                            <span>
                              $
                              {(
                                item.item.price *
                                (item.size === "Large" ? 2 : item.size === "Medium" ? 1.5 : 1) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R${(seatsTotal + snacksTotal).toFixed(2)}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({discount}%)</span>
                      <span>-R${((seatsTotal + snacksTotal) * discount / 100).toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-xl">
                    <span>Total</span>
                    <span>R${total.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span>Você ganhará {Math.floor(total)} pontos de fidelidade</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleConfirmBooking}>
                    Confirmar e Pagar
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header 
        user={user} 
        onProfileClick={() => setCurrentView("profile")}
        onPromosClick={() => setCurrentView("promos")}
        onBrowseClick={() => setCurrentView("browse")}
        onTheatersClick={() => setCurrentView("theaters")}
        onHomeClick={handleBackToHome}
        onLogout={handleLogout}
      />

      {/* Home View */}
      {currentView === "home" && (
        <div className="animate-fade-in">
          {featuredMovie && (
            <MovieHero
              title={featuredMovie.title}
              description={featuredMovie.description}
              genre={featuredMovie.genre.join(", ")}
              duration={featuredMovie.duration}
              rating={featuredMovie.rating}
              backgroundImage={featuredMovie.backdrop}
              onBookNow={() => handleMovieClick(featuredMovie)}
            />
          )}

          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2>Em Alta</h2>
              <Button variant="ghost" onClick={() => setCurrentView("browse")}>
                Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {trendingMovies.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingMovies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    {...movie}
                    genre={movie.genre.join(", ")}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="bg-muted py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2>Em Breve</h2>
              </div>
              {comingSoon.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {comingSoon.map(movie => (
                    <MovieCard
                      key={movie.id}
                      {...movie}
                      genre={movie.genre.join(", ")}
                      onClick={() => handleMovieClick(movie)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="mb-6">Ofertas Especiais</h2>
            {promosState.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {promosState.slice(0, 4).map(promo => (
                  <Card key={promo.id} className="p-6 relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
                    <Badge className="mb-3">{promo.discount}% OFF</Badge>
                    <h3 className="mb-2">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
                    <code className="text-xs px-2 py-1 bg-muted rounded">{promo.code}</code>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="bg-muted py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-red-600" />
                  <h3 className="mb-2">Reserva Fácil</h3>
                  <p className="text-muted-foreground">Reserve seus assentos em apenas alguns cliques</p>
                </Card>
                <Card className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-red-600" />
                  <h3 className="mb-2">Recompensas de Fidelidade</h3>
                  <p className="text-muted-foreground">Ganhe pontos a cada compra</p>
                </Card>
                <Card className="p-6 text-center">
                  <Film className="w-12 h-12 mx-auto mb-4 text-red-600" />
                  <h3 className="mb-2">Experiência Premium</h3>
                  <p className="text-muted-foreground">State-of-the-art screens and sound</p>
                </Card>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Browse View */}
      {currentView === "browse" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="mb-8">Explorar Filmes</h1>
          
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedGenres={selectedGenres}
            onGenreToggle={handleGenreToggle}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {filteredMovies.length === 0 ? (
            <Card className="p-12 text-center">
              <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Nenhum filme encontrado</h3>
              <p className="text-muted-foreground mb-4">Tente ajustar seus filtros</p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedGenres([]);
              }}>
                Limpar Filtros
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  {...movie}
                  genre={movie.genre.join(", ")}
                  onClick={() => handleMovieClick(movie)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Movie Details View */}
      {currentView === "movie-details" && selectedMovie && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setCurrentView("browse")} className="mb-6">
            ← Voltar para a Lista
          </Button>

          {/* Movie Header with Backdrop */}
          <div className="relative h-[400px] -mx-4 mb-8 overflow-hidden rounded-lg">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedMovie.backdrop})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
            <div className="relative h-full flex items-end p-8">
              <div className="flex gap-6">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-48 rounded-lg shadow-2xl"
                />
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {selectedMovie.genre.map(g => (
                      <Badge key={g} variant="outline">{g}</Badge>
                    ))}
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                      {selectedMovie.rating}
                    </Badge>
                  </div>
                  <h1 className="text-white mb-3">{selectedMovie.title}</h1>
                  <div className="flex items-center gap-4 text-white/80 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedMovie.duration}
                    </span>
                    <span>{selectedMovie.releaseDate}</span>
                    <span>{selectedMovie.ageRating}</span>
                    <span>{selectedMovie.language}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" onClick={() => setMovieDetailsTab("showtimes")}>
                      <Ticket className="w-4 h-4 mr-2" />
                      Reservar Ingressos
                    </Button>
                    <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Play className="w-4 h-4 mr-2" />
                      Trailer
                    </Button>
                    <Button size="icon" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={movieDetailsTab} onValueChange={setMovieDetailsTab} className="mb-12">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="showtimes">Sessões</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <h2 className="mb-4">Sinopse</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedMovie.description}
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h2 className="mb-4">Elenco e Equipe</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Diretor</p>
                        <p>{selectedMovie.director}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Cast</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedMovie.cast.map(actor => (
                            <Badge key={actor} variant="outline">{actor}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="mb-4">Informações do Filme</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Lançamento</span>
                        <span>{selectedMovie.releaseDate}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração</span>
                        <span>{selectedMovie.duration}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Idioma</span>
                        <span>{selectedMovie.language}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Classificação</span>
                        <span>{selectedMovie.ageRating}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-primary" />
                      <h3>Dica Rápida</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reserve seus ingressos com antecedência para as sessões mais populares. Assentos VIP e Deluxe oferecem conforto extra!
                    </p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="showtimes" className="mt-6"> 
              <Card className="p-6">
                <h2 className="mb-6">Select Showtime</h2>
                <div className="space-y-4">
                  {["Nov 7", "Nov 8", "Nov 9"].map(date => (
                    <div key={date}>
                      <p className="mb-3">{date}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {showtimes
                          .filter(s => s.movieId === selectedMovie.id && s.date === date)
                          .map(showtime => (
                            <Button
                              key={showtime.id}
                              variant="outline"
                              className="h-auto py-4 flex flex-col items-start gap-1"
                              onClick={() => handleShowtimeSelect(showtime)}
                            >
                              <span>{showtime.time}</span>
                              <span className="text-xs text-muted-foreground">{showtime.screenType}</span>
                              <span className="text-xs text-muted-foreground">
                                {showtime.availableSeats} assentos
                              </span>
                            </Button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ReviewSection
                reviews={selectedMovie.reviews}
                averageRating={selectedMovie.averageRating}
                totalReviews={selectedMovie.totalReviews}
                onAddReview={handleAddReview}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Profile View */}
      {currentView === "profile" && user && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <UserProfile user={user} onClose={handleBackToHome} />
        </div>
      )}

      {/* Promos View */}
      {currentView === "promos" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setCurrentView("home")} className="mb-6">
            ← Voltar para o Início
          </Button>
          <PromoSection promos={promosState} onApplyPromo={handleApplyPromo} />
        </div>
      )}

      {/* Theaters View */}
      {currentView === "theaters" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setCurrentView("home")} className="mb-6">
            ← Voltar para o Início
          </Button>
          <h1 className="mb-8">Nossos Cinemas</h1>
          <p>Página de cinemas em construção.</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={currentView === "confirmation"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center py-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <h2 className="mb-2">Reserva Confirmada!</h2>
            <p className="text-muted-foreground mb-6">
              Seus ingressos foram enviados para {user.email}
            </p>

            <Card className="p-6 text-left mb-6 bg-muted">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span>{selectedMovie?.title}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data e Hora</span>
                  <span>{selectedShowtime?.date} at {selectedShowtime?.time}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tela</span>
                  <span>{selectedShowtime?.screen} - {selectedShowtime?.screenType}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assentos</span>
                  <span>{selectedSeats.map(s => s.id).join(", ")}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total Pago</span>
                  <span className="text-xl">R${calculateTotal().total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 pt-3 border-t">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm">+{Math.floor(calculateTotal().total)} pontos de fidelidade ganhos</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button className="w-full" size="lg" onClick={handleBackToHome}> 
                Voltar para o Início
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setCurrentView("profile")}>
                Ver Minhas Reservas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// Header Component
function Header({ 
  user, 
  onProfileClick, 
  onPromosClick,
  onBrowseClick,
  onTheatersClick,
  onHomeClick,
  onLogout
}: { 
  user: User | null; 
  onProfileClick: () => void;
  onPromosClick?: () => void;
  onBrowseClick?: () => void;
  onTheatersClick?: () => void;
  onHomeClick?: () => void;
  onLogout?: () => void;
}) {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={onHomeClick}
          >
            <Film className="w-8 h-8 text-red-600" />
            <span className="text-2xl">CineTech</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={onHomeClick}>Início</Button>
            <Button variant="ghost" onClick={onBrowseClick}>Filmes</Button>
            <Button variant="ghost" onClick={onPromosClick}>Ofertas</Button>
            <Button variant="ghost" onClick={onTheatersClick}>Cinemas</Button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">New York, NY</span>
            </div>
            {user && (
              <>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={onProfileClick}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Button>
                {onLogout && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onLogout}
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t mt-auto bg-muted">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-6 h-6 text-red-600" />
              <span className="text-xl">CineMax</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu principal destino para os filmes mais recentes e experiências de cinema inesquecíveis.
            </p>
          </div>
          <div>
            <h3 className="mb-4">Filmes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Em Cartaz</li>
              <li>Em Breve</li>
              <li>IMAX</li>
              <li>Filmes 3D</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Central de Ajuda</li>
              <li>Fale Conosco</li>
              <li>Termos de Serviço</li>
              <li>Política de Privacidade</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@cinemax.com</li>
              <li>(555) 123-4567</li>
              <li>Rua do Cinema, 123</li>
              <li>New York, NY 10001</li>
            </ul>
          </div>
        </div>
        <Separator className="mb-8" />
        <div className="text-center text-sm text-muted-foreground">
          © 2025 CineMax. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
