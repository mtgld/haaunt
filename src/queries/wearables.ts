export const wearablesQuery = `
    query {
       itemTypes(first: 1000, where: {canBeTransferred: true, category: 0}) {
          id,
          name,
          author,
          slotPositions,
          traitModifiers,
          maxQuantity,
          rarityScoreModifier
       }
    }
`
