import { Promo } from "../types";

export const promos: Promo[] = [
  {
    id: "p1",
    title: "Especial Fim de Semana",
    description: "Ganhe 20% de desconto em todas as sessões de sábado e domingo",
    discount: 20,
    code: "FIMDESEMANA20",
    validUntil: "31 Dez, 2025",
    minPurchase: 0
  },
  {
    id: "p2",
    title: "Pacote Família",
    description: "Compre 4 ingressos e ganhe 2 combos de pipoca grátis",
    discount: 15,
    code: "FAMILIA4",
    validUntil: "30 Nov, 2025",
    minPurchase: 48
  },
  {
    id: "p3",
    title: "Desconto Estudante",
    description: "15% de desconto com carteira de estudante válida",
    discount: 15,
    code: "ESTUDANTE15",
    validUntil: "31 Dez, 2025",
    minPurchase: 0
  },
  {
    id: "p4",
    title: "Matinê",
    description: "Sessões antes das 12h - 25% de desconto",
    discount: 25,
    code: "MATINE25",
    validUntil: "15 Dez, 2025",
    minPurchase: 0
  }
];