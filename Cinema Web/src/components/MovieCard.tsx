import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MovieCardProps {
  id: string;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  poster: string;
  onClick: () => void;
}

export function MovieCard({ title, genre, duration, rating, poster, onClick }: MovieCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-xl flex flex-col"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3]">
        <ImageWithFallback
          src={poster}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {rating}
          </Badge>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="mb-2 line-clamp-2 h-[2.5em]">{title}</h3>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-sm">{genre}</span>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4" />
            {duration}
          </div>
        </div>
      </div>
    </Card>
  );
}
