import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
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

  try {
    // ETAPA 1: Criar o documento da compra na coleção 'purchaseHistory'.
    // Esta é a forma mais direta de adicionar um novo documento.
    const purchaseCollectionRef = collection(db, "purchaseHistory");
    await addDoc(purchaseCollectionRef, {
      userId: userId,
      movieTitle: bookingDetails.movieTitle,
      movieId: bookingDetails.movieId,
      showtime: bookingDetails.showtime,
      seats: bookingDetails.seats.map(s => s.id),
      snacks: bookingDetails.snacks.map(s => ({ itemId: s.id, quantity: s.quantity, size: s.size })),
      total: bookingDetails.total,
      purchaseDate: serverTimestamp(),
      status: "confirmed"
    });
    console.log("SUCESSO: Documento da compra criado em 'purchaseHistory'.");

    // ETAPA 2: Atualizar os pontos de fidelidade do usuário.
    const userRef = doc(db, "users", userId);
    const pointsToAdd = Math.round(bookingDetails.total);
    await updateDoc(userRef, {
      loyaltyPoints: increment(pointsToAdd)
    });
    console.log(`SUCESSO: ${pointsToAdd} pontos adicionados ao usuário ${userId}.`);

  } catch (error) {
    console.error("--- ERRO AO SALVAR NO BANCO DE DADOS ---", error);
    // Lançar o erro novamente para que o componente do botão possa pegá-lo
    throw error;
  }
};