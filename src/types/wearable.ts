export interface Wearable {
  author: string;
  id: string
  maxQuantity: string;
  name: string;
  rarityScoreModifier: number;
  slotPositions: boolean[];
  traitModifiers: number[];
  brs?: number;
  color?: string;
  rarity?: string;
  slot?: string;
}
