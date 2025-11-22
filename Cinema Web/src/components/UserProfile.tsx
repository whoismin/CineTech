import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User as UserIcon, Star, Calendar, Award, Ticket, Gift } from "lucide-react";
import { User, Booking } from "../types";

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

export function UserProfile({ user, onClose }: UserProfileProps) {
  const nextTierPoints = 1000;
  const pointsProgress = (user.loyaltyPoints / nextTierPoints) * 100;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Perfil */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="mb-1">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Membro desde {user.memberSince}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {/* Pontos de Fidelidade */}
        <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span>Pontos de Fidelidade</span>
            </div>
            <Badge variant="default" className="bg-yellow-600">
              Membro Ouro
            </Badge>
          </div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-3xl">{user.loyaltyPoints}</p>
              <p className="text-sm text-muted-foreground">pontos</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {nextTierPoints - user.loyaltyPoints} pontos para Platina
            </p>
          </div>
          <Progress value={pointsProgress} className="h-2" />
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Ticket className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl mb-1">{user.bookings.length}</p>
          <p className="text-sm text-muted-foreground">Total de Reservas</p>
        </Card>
        <Card className="p-4 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl mb-1">{user.loyaltyPoints}</p>
          <p className="text-sm text-muted-foreground">Pontos Ganhos</p>
        </Card>
        <Card className="p-4 text-center">
          <Gift className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-2xl mb-1">3</p>
          <p className="text-sm text-muted-foreground">Recompensas Disponíveis</p>
        </Card>
      </div>

      {/* Histórico de Reservas */}
      <Card className="p-6">
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="space-y-4">
              {user.bookings.filter(b => b.status === "confirmed").length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma reserva próxima</p>
                </div>
              ) : (
                user.bookings
                  .filter(b => b.status === "confirmed")
                  .map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {user.bookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg">{booking.movieTitle}</h3>
            <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
              {booking.status}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {booking.showtime}
            </p>
            <p className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Assentos: {booking.seats.join(", ")}
            </p>
            {booking.snacks.length > 0 && (
              <p className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {booking.snacks.length} itens de lanche
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl mb-1">R${booking.total.toFixed(2)}</p>
          <Badge variant="outline" className="gap-1">
            <Award className="w-3 h-3" />
            +{booking.pointsEarned} pts
          </Badge>
        </div>
      </div>
    </Card>
  );
}
