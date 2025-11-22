import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Clock, Star, Calendar } from "lucide-react";

interface MovieHeroProps {
  title: string;
  description: string;
  genre: string;
  duration: string;
  rating: number;
  backgroundImage: string;
  onBookNow: () => void;
}

export function MovieHero({ 
  title, 
  description, 
  genre, 
  duration, 
  rating, 
  backgroundImage,
  onBookNow 
}: MovieHeroProps) {
  return (
    <div className="relative h-[500px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>
      
      <div className="relative h-full flex items-center px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <Star className="w-3 h-3 mr-1 fill-yellow-500" />
              {rating}
            </Badge>
            <Badge variant="outline">{genre}</Badge>
            <div className="flex items-center gap-1 text-white/80">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{duration}</span>
            </div>
          </div>
          
          <h1 className="text-white mb-4">{title}</h1>
          <p className="text-white/90 mb-6 text-lg">{description}</p>
          
          <div className="flex gap-3">
            <Button size="lg" onClick={onBookNow}>
              <Calendar className="w-4 h-4 mr-2" />
              Reservar Ingressos
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Play className="w-4 h-4 mr-2" />
              Assistir Trailer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
