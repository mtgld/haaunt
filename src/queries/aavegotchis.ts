export const aavegotchisQuery = `
    query($maxId: Int!) {
      aavegotchis(first: 1000, where:{ id_gt: $maxId }) {
        gotchiId
        name
        level
        experience
        baseRarityScore
        modifiedRarityScore
        numericTraits
        modifiedNumericTraits
        kinship
        owner {
          id
        }
       }
    }
`