import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const genres = [
  "Ação", "Aventura", "Animação", "Comédia", "Crime", 
  "Documentário", "Drama", "Fantasia", "Terror", "Mistério", 
  "Romance", "Ficção Científica", "Suspense"
];

export function FilterBar({
  searchTerm,
  onSearchChange,
  selectedGenres,
  onGenreToggle,
  sortBy,
  onSortChange
}: FilterBarProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Pesquisa e Ordenação */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar filmes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Mais Populares</SelectItem>
            <SelectItem value="rating">Melhor Avaliação</SelectItem>
            <SelectItem value="title">Título A-Z</SelectItem>
            <SelectItem value="newest">Mais Recentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por Gênero */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">Gêneros:</span>
          {selectedGenres.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedGenres.forEach(g => onGenreToggle(g))}
              className="h-6 text-xs"
            >
              Limpar Tudo
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <Badge
                key={genre}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => onGenreToggle(genre)}
              >
                {genre}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
