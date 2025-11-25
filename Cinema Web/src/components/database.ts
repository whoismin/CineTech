import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { CartItem, Seat } from "../types";

/**
 * Salva uma nova reserva no documento do usuário no Firestore.
 * @param userId - O ID do usuário que está fazendo a reserva.
 * @param bookingDetails - Um objeto contendo todos os detalhes da reserva.
 */
export const saveBooking = async (
  userId: string,
  bookingDetails: {
    movieTitle: string;
    movieId: string;
    showtime: string;
    seats: Seat[];
    snacks: CartItem[];
    total: number;
  }
) => {
  console.log("Iniciando saveBooking para o usuário:", userId);
  console.log("Detalhes da compra:", bookingDetails);

  // Adiciona uma verificação para garantir que o userId é válido
  if (!userId) {
    console.error("--- ERRO FATAL: userId é nulo ou indefinido. O usuário está logado? ---");
    throw new Error("Usuário não autenticado. Não é possível salvar a compra.");
  }

  try {
    // Calcula os pontos de fidelidade ganhos nesta compra.
    const pointsToAdd = Math.round(bookingDetails.total);

    // ETAPA 1: Criar o documento da compra na coleção 'compras'.
    const purchaseCollectionRef = collection(db, "compras");
    await addDoc(purchaseCollectionRef, {
      userId: userId,
      movieTitle: bookingDetails.movieTitle,
      movieId: bookingDetails.movieId,
      showtime: bookingDetails.showtime,
      seats: Array.isArray(bookingDetails.seats) ? bookingDetails.seats.map(s => s.id) : [],
      snacks: bookingDetails.snacks.map(s => {
        const snackData: any = { itemId: s.id, quantity: s.quantity };
        if (s.size) {
          snackData.size = s.size;
        }
        return snackData;
      }),
      total: bookingDetails.total,
      purchaseDate: serverTimestamp(),
      status: "confirmed",
      pointsEarned: pointsToAdd // Adiciona os pontos ganhos ao documento da compra
    });
    console.log("SUCESSO: Documento da compra criado em 'compras'.");

    // ETAPA 2: Atualizar os pontos de fidelidade do usuário.
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      loyaltyPoints: increment(pointsToAdd)
    }, { merge: true });
    console.log(`SUCESSO: ${pointsToAdd} pontos adicionados ao usuário ${userId}.`);

  } catch (error) {
    console.error("--- ERRO AO SALVAR NO BANCO DE DADOS ---", error);
    // Lançar o erro novamente para que o componente do botão possa pegá-lo
    throw error;
  }
};