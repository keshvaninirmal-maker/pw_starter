export const PRODUCTS = {
  search: {
    validKeyword: 'Pliers',
    invalidKeyword: 'xyzabc123',
    captionPrefix: 'Searched for: ',
  },
  categories: {
    handTools: 'Hand Tools',
    powerTools: 'Power Tools',
  },
  sort: {
    priceAsc: 'price,asc',
    nameAsc: 'name,asc',
  },
} as const;
