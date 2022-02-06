export const aavegotchisQuery = `
    query($skip: Int!, $orderd: String!, $id: Int!, $hauntId: String!) {
      aavegotchis(first: 1000, skip: $skip, orderBy: id, orderDirection: $orderd, where:{ status: 3, owner_not: "0x0000000000000000000000000000000000000000", hauntId: $hauntId, id_gte: $id }) {
        id
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