export interface Aavegotchi {
  experience: string,
  gotchiId: string,
  owner: {
    id: string
  }
  kinship: string,
  level: string,
  modifiedRarityScore: string,
  baseRarityScore
  name: string,
  numericTraits: [number, number, number, number, number, number]
  energy: number;
  brain: number;
  eys: number;
  eyc: number;
  aggression: number;
  spookiness: number;
  modifiedNumericTraits: [number, number, number, number, number, number]
}