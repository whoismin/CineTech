import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { saveBooking } from '../services/database';
import { Movie, Seat, CartItem } from '../types';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  movie: Movie;
  selectedShowtime: string;
  selectedSeats: Seat[];
  snackCart: CartItem[];
  total: number;
  onPurchaseSuccess: () => void; // Função para ser chamada após o sucesso
}

export function CheckoutButton({ movie, selectedShowtime, selectedSeats, snackCart, total, onPurchaseSuccess }: CheckoutButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para finalizar a compra.");
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error("Por favor, selecione pelo menos um assento.");
      return;
    }

    setIsLoading(true);
    try {
      await saveBooking(user.uid, {
        movieTitle: movie.title,
        movieId: movie.id,
        showtime: selectedShowtime,
        seats: selectedSeats,
        snacks: snackCart,
        total: total,
      });
      toast.success("Compra realizada com sucesso! 🎉");
      onPurchaseSuccess(); // Avisa o componente pai que a compra foi um sucesso
    } catch (error) {
      console.error("Erro detalhado ao salvar a compra:", error);
      toast.error("Não foi possível salvar sua compra. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className="w-full">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
    </Button>
  );
}