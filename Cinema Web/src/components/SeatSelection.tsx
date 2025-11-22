import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Monitor, Info } from "lucide-react";
import { useState } from "react";
import { Seat } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SeatSelectionProps {
  movieTitle: string;
  showtime: string;
  screenType: string;
  onConfirm: (seats: Seat[]) => void;
  onBack: () => void;
}

export function SeatSelection({ movieTitle, showtime, screenType, onConfirm, onBack }: SeatSelectionProps) {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatsPerRow = 14;

  // Inicializa os assentos com diferentes tipos
  const [seats, setSeats] = useState<Seat[]>(() => {
    const allSeats: Seat[] = [];
    rows.forEach((row, rowIndex) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        const randomOccupied = Math.random() > 0.75;

        // Determina o tipo do assento baseado na posição
        let type: Seat["type"] = "Padrão";
        let price = 12;

        // Assentos VIP (fileiras do meio, assentos centrais)
        if (rowIndex >= 4 && rowIndex <= 6 && i >= 5 && i <= 10) {
          type = "VIP";
          price = 18;
        }
        // Assentos Deluxe (fileiras do fundo)
        else if (rowIndex >= 8) {
          type = "Deluxe";
          price = 22;
        }

        allSeats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type,
          status: randomOccupied ? "occupied" : "available",
          price
        });
      }
    });
    return allSeats;
  });

  const toggleSeat = (seatId: string) => {
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        if (seat.id === seatId && seat.status !== "occupied") {
          return {
            ...seat,
            status: seat.status === "available" ? "selected" : "available"
          };
        }
        return seat;
      })
    );
  };

  const selectedSeats = seats.filter(s => s.status === "selected");
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const getSeatColor = (seat: Seat) => {
    if (seat.status === "occupied") {
      return "bg-red-500 cursor-not-allowed opacity-50";
    }
    if (seat.status === "selected") {
      return "bg-blue-500 text-white";
    }

    // Assentos disponíveis com cores por tipo
    if (seat.type === "VIP") {
      return "bg-purple-200 hover:bg-purple-300 dark:bg-purple-900 dark:hover:bg-purple-800";
    }
    if (seat.type === "Deluxe") {
      return "bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800";
    }
    return "bg-gray-200 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-blue-900";
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack}>← Voltar</Button>
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-2">
              <h2>{movieTitle}</h2>
              <Badge>{screenType}</Badge>
            </div>
            <p className="text-muted-foreground">{showtime}</p>
          </div>
        </div>

        <Card className="p-8 mb-6">
          {/* Tela */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-4/5 h-3 bg-gradient-to-b from-white to-gray-300 rounded-t-3xl mb-3 shadow-lg" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <span className="text-sm">TELA</span>
            </div>
          </div>

          {/* Grade de Assentos */}
          <div className="space-y-2 mb-8">
            {rows.map(row => (
              <div key={row} className="flex items-center justify-center gap-2">
                <span className="w-8 text-center text-muted-foreground">{row}</span>
                <div className="flex gap-1">
                  {seats
                    .filter(seat => seat.row === row)
                    .map((seat, index) => {
                      const showGap = index === Math.floor(seatsPerRow / 2);
                      return (
                        <div key={seat.id} className="flex gap-1">
                          {showGap && <div className="w-4" />}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => toggleSeat(seat.id)}
                                  disabled={seat.status === "occupied"}
                                  className={`w-8 h-8 rounded-t-lg transition-all text-xs ${getSeatColor(seat)}`}
                                >
                                  {seat.status === "selected" && "✓"}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{seat.id} - {seat.type} R${seat.price}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      );
                    })}
                </div>
                <span className="w-8 text-center text-muted-foreground">{row}</span>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <span>Padrão (R$12)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-200 dark:bg-purple-900 rounded-t-lg" />
              <span>VIP (R$18)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-200 dark:bg-amber-900 rounded-t-lg" />
              <span>Deluxe (R$22)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-t-lg" />
              <span>Selecionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-t-lg" />
              <span>Ocupado</span>
            </div>
          </div>
        </Card>

        {/* Banner informativo */}
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="mb-1">
                <strong>Assentos VIP:</strong> Mais espaço para as pernas e conforto premium
              </p>
              <p>
                <strong>Assentos Deluxe:</strong> Assentos reclináveis com som premium
              </p>
            </div>
          </div>
        </Card>

        {/* Resumo da Reserva */}
        {selectedSeats.length > 0 && (
          <Card className="p-6 sticky bottom-4 bg-background shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Assentos Selecionados ({selectedSeats.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(s => (
                    <Badge key={s.id} variant="outline">
                      {s.id} - {s.type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-3xl mb-2">R${totalPrice.toFixed(2)}</p>
                <Button 
                  size="lg"
                  onClick={() => onConfirm(selectedSeats)}
                >
                  Continuar para Snacks →
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
