export const aavegotchisQuery = `
    query {
      aavegotchis(first: 1000) {
        gotchiId
        name
        level
        modifiedRarityScore
        numericTraits
        kinship
        owner {
          id
        }
        experience
       }
    }
`