export const aavegotchisByOwnerQuery = `
    query($owner: String!) {
      aavegotchis(where: {owner: $owner}) {
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