export interface Aavegotchi {
  experience: string,
  gotchiId: string,
  owner: {
    id: string
  }
  kinship: string,
  level: string,
  modifiedRarityScore: string,
  name: string,
  numericTraits: [number, number, number, number, number, number]
}