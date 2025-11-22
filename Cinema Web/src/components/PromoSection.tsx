import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tag, Copy, Calendar, DollarSign } from "lucide-react";
import { Promo } from "../types";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface PromoSectionProps {
  promos: Promo[];
  onApplyPromo: (code: string) => void;
}

export function PromoSection({ promos, onApplyPromo }: PromoSectionProps) {
  const [promoCode, setPromoCode] = useState("");

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código promocional copiado para a área de transferência!");
  };

  const handleApply = () => {
    if (promoCode.trim()) {
      onApplyPromo(promoCode.toUpperCase());
      setPromoCode("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Ofertas Especiais</h2>
        <p className="text-muted-foreground">Economize mais com nossas promoções exclusivas</p>
      </div>

      {/* Aplicar Código Promocional */}
      <Card className="p-6">
        <h3 className="mb-4">Possui um código promocional?</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Digite o código promocional"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button onClick={handleApply}>Aplicar</Button>
        </div>
      </Card>

      {/* Promoções Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map(promo => (
          <Card key={promo.id} className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="default" className="gap-1">
                  <Tag className="w-3 h-3" />
                  {promo.discount}% OFF
                </Badge>
              </div>

              <h3 className="mb-2">{promo.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{promo.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Válido até {promo.validUntil}</span>
                </div>
                {promo.minPurchase > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>Compra mínima R$ {promo.minPurchase}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-center">
                  {promo.code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyCode(promo.code)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
