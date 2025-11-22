import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { SnackItem, CartItem } from "../types";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SnackBarProps {
  snacks: SnackItem[];
  cart: CartItem[];
  onAddToCart: (item: SnackItem, size?: string) => void;
  onRemoveFromCart: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export function SnackBar({ snacks, cart, onAddToCart, onRemoveFromCart, onUpdateQuantity }: SnackBarProps) {
  const categories = ["Pipoca", "Bebidas", "Comidas", "Doces"] as const;

  const getCartItem = (itemId: string) => cart.find(c => c.item.id === itemId);

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      let price = item.item.price;
      if (item.size) {
        if (item.size === "Medium") price *= 1.5;
        if (item.size === "Large") price *= 2;
      }
      return sum + price * item.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Snacks & Bebidas</h2>
          <p className="text-muted-foreground">Complete sua experiência no cinema</p>
        </div>
        {cart.length > 0 && (
          <Badge variant="default" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
          </Badge>
        )}
      </div>

      <Tabs defaultValue="Pipoca">
        <TabsList className="grid w-full grid-cols-4">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {snacks
                .filter(snack => snack.category === category)
                .map(snack => {
                  const cartItem = getCartItem(snack.id);
                  return (
                    <Card key={snack.id} className="overflow-hidden flex flex-col">
                      <div className="aspect-video relative">
                        <ImageWithFallback
                          src={snack.image}
                          alt={snack.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg line-clamp-1">{snack.name}</h3>
                            <p className="text-sm text-muted-foreground">{snack.description}</p>
                          </div>
                          <p className="text-lg">${snack.price.toFixed(2)}</p>
                        </div>

                        {snack.sizes && (
                          <div className="flex gap-2 mb-3">
                            {snack.sizes.map(size => (
                              <Button
                                key={size}
                                variant="outline"
                                size="sm"
                                onClick={() => onAddToCart(snack, size)}
                              >
                                {size}
                              </Button>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto pt-4"> {!cartItem ? (
                          <Button
                            className="w-full"
                            onClick={() => onAddToCart(snack)}
                          >
                            Adicionar ao Carrinho
                          </Button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (cartItem.quantity === 1) {
                                    onRemoveFromCart(snack.id);
                                  } else {
                                    onUpdateQuantity(snack.id, cartItem.quantity - 1);
                                  }
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center">{cartItem.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onUpdateQuantity(snack.id, cartItem.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveFromCart(snack.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        )}</div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Resumo do Carrinho */}
      {cart.length > 0 && (
        <Card className="p-6 sticky bottom-0 bg-background shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Snacks</p>
              <div className="space-y-1">
                {cart.map(item => (
                  <p key={item.item.id} className="text-sm">
                    {item.quantity}x {item.item.name}
                    {item.size && ` (${item.size})`}
                  </p>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl">${getTotal().toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
