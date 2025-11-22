export interface Movie {
  id: string;
  title: string;
  genre: string[];
  duration: string;
  rating: number;
  poster: string;
  backdrop: string;
  description: string;
  director: string;
  cast: string[];
  releaseDate: string;
  language: string;
  ageRating: string;
  trailerUrl: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  time: string;
  date: string;
  screen: string;
  screenType: "Standard" | "IMAX" | "3D" | "4DX";
  price: number;
  availableSeats: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: "Standard" | "VIP" | "Deluxe";
  status: "available" | "selected" | "occupied";
  price: number;
}

export interface SnackItem {
  id: string;
  name: string;
  category: "Popcorn" | "Drinks" | "Candy" | "Food";
  price: number;
  image: string;
  description: string;
  sizes?: string[];
}

export interface CartItem {
  item: SnackItem;
  quantity: number;
  size?: string;
}

export interface Booking {
  id: string;
  movieTitle: string;
  showtime: string;
  seats: string[];
  snacks: CartItem[];
  total: number;
  date: string;
  status: "confirmed" | "cancelled";
  pointsEarned: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  loyaltyPoints: number;
  memberSince: string;
  bookings: Booking[];
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  discount: number;
  code: string;
  validUntil: string;
  minPurchase: number;
}
