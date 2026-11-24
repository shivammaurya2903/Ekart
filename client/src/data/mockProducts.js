export const CATEGORIES = ['All', 'Mobiles', 'Laptops', 'Footwear', 'Audio', 'Accessories'];

const IMAGES = {
  mobiles: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
  ],
  laptops: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
  ],
  footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80'
  ],
  audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80'
  ],
  accessories: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80'
  ]
};

const monthDate = (monthsAgo) => {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() - monthsAgo);
  return date.toISOString();
};

const buildPriceHistory = (currentPrice, multipliers) => multipliers.map((multiplier, index) => ({
  price: Math.round(currentPrice * multiplier),
  date: monthDate(multipliers.length - 1 - index)
}));

const PRODUCT_DEFINITIONS = [
  {
    id: 'mock-001',
    name: 'Nothing Phone (2a) 5G (Black, 256GB)',
    category: 'Mobiles',
    specs: {
      brand: 'Nothing',
      display: '6.7 inch flexible AMOLED, 120Hz',
      processor: 'MediaTek Dimensity 7200 Pro',
      ram: '8GB',
      storage: '256GB',
      camera: '50MP + 50MP dual rear camera',
      battery: '5000mAh',
      charging: '45W fast charging',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3'
    },
    currentPrice: 22999,
    mrp: 25999,
    stock: 34,
    rating: 4.4,
    images: IMAGES.mobiles,
    history: [1.12, 1.08, 1.05, 0.98, 1.03, 1]
  },
  {
    id: 'mock-002',
    name: 'Apple iPhone 15 (Blue, 128GB)',
    category: 'Mobiles',
    specs: {
      brand: 'Apple',
      display: '6.1 inch Super Retina XDR, 60Hz',
      processor: 'Apple A16 Bionic',
      ram: '6GB',
      storage: '128GB',
      camera: '48MP + 12MP dual rear camera',
      battery: '3349mAh',
      charging: '20W fast charging',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3'
    },
    currentPrice: 62900,
    mrp: 69900,
    stock: 18,
    rating: 4.7,
    images: IMAGES.mobiles,
    history: [1.08, 1.06, 1.03, 0.95, 0.98, 1]
  },
  {
    id: 'mock-003',
    name: 'Samsung Galaxy S24 5G (Onyx Black, 256GB)',
    category: 'Mobiles',
    specs: {
      brand: 'Samsung',
      display: '6.2 inch Dynamic AMOLED 2X, 120Hz',
      processor: 'Exynos 2400',
      ram: '8GB',
      storage: '256GB',
      camera: '50MP + 12MP + 10MP triple rear camera',
      battery: '4000mAh',
      charging: '25W fast charging',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3'
    },
    currentPrice: 69999,
    mrp: 84999,
    stock: 24,
    rating: 4.6,
    images: IMAGES.mobiles,
    history: [1.12, 1.08, 1.05, 1.03, 1.01, 1]
  },
  {
    id: 'mock-004',
    name: 'OnePlus 12R 5G (Cool Blue, 128GB)',
    category: 'Mobiles',
    specs: {
      brand: 'OnePlus',
      display: '6.78 inch AMOLED, 120Hz',
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB',
      storage: '128GB',
      camera: '50MP + 8MP + 2MP triple rear camera',
      battery: '5500mAh',
      charging: '100W SUPERVOOC',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3'
    },
    currentPrice: 34999,
    mrp: 42999,
    stock: 36,
    rating: 4.5,
    images: IMAGES.mobiles,
    history: [1.1, 1.06, 1.04, 0.97, 1.02, 1]
  },
  {
    id: 'mock-005',
    name: 'Apple MacBook Air M3 (Midnight, 13-inch, 8GB/256GB SSD)',
    category: 'Laptops',
    specs: {
      brand: 'Apple',
      display: '13.6 inch Liquid Retina, 2560x1664',
      processor: 'Apple M3',
      ram: '8GB unified memory',
      storage: '256GB SSD',
      graphics: '10-core GPU',
      battery: 'Up to 18 hours',
      weight: '1.24 kg'
    },
    currentPrice: 99900,
    mrp: 114900,
    stock: 12,
    rating: 4.8,
    images: IMAGES.laptops,
    history: [1.1, 1.07, 1.04, 1.02, 1, 1]
  },
  {
    id: 'mock-006',
    name: 'ASUS ROG Strix G16 (Core i7, RTX 4060, 16GB/1TB SSD)',
    category: 'Laptops',
    specs: {
      brand: 'ASUS',
      display: '16 inch Full HD IPS, 165Hz',
      processor: 'Intel Core i7-13650HX',
      ram: '16GB DDR5',
      storage: '1TB SSD',
      graphics: 'NVIDIA GeForce RTX 4060',
      battery: '90Wh',
      weight: '2.5 kg'
    },
    currentPrice: 119990,
    mrp: 139990,
    stock: 9,
    rating: 4.6,
    images: IMAGES.laptops,
    history: [1.08, 1.06, 1.03, 0.96, 1.01, 1]
  },
  {
    id: 'mock-007',
    name: 'HP Pavilion 15 (Natural Silver, Core i5 13th Gen, 16GB/512GB SSD)',
    category: 'Laptops',
    specs: {
      brand: 'HP',
      display: '15.6 inch Full HD IPS, 250 nits',
      processor: 'Intel Core i5-1335U',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      graphics: 'Intel Iris Xe',
      battery: '52.5Wh',
      weight: '1.75 kg'
    },
    currentPrice: 58990,
    mrp: 72999,
    stock: 20,
    rating: 4.3,
    images: IMAGES.laptops,
    history: [1.12, 1.08, 1.05, 0.96, 1.01, 1]
  },
  {
    id: 'mock-008',
    name: 'Lenovo IdeaPad Slim 5 (Cloud Grey, Ryzen 7, 16GB/1TB SSD)',
    category: 'Laptops',
    specs: {
      brand: 'Lenovo',
      display: '15.6 inch Full HD IPS, 300 nits',
      processor: 'AMD Ryzen 7 7730U',
      ram: '16GB DDR4',
      storage: '1TB SSD',
      graphics: 'AMD Radeon Graphics',
      battery: '60Wh',
      weight: '1.62 kg'
    },
    currentPrice: 64990,
    mrp: 79990,
    stock: 15,
    rating: 4.4,
    images: IMAGES.laptops,
    history: [1.09, 1.06, 1.03, 1.01, 1, 1]
  },
  {
    id: 'mock-009',
    name: 'Nike Air Max 270 Running Shoes (Black/White)',
    category: 'Footwear',
    specs: {
      brand: 'Nike',
      type: 'Lifestyle running shoes',
      upper: 'Mesh and synthetic overlays',
      cushioning: 'Air Max 270 heel unit',
      sole: 'Rubber outsole',
      weight: '310 g',
      sizes: 'UK 6 to UK 11'
    },
    currentPrice: 8995,
    mrp: 14995,
    stock: 48,
    rating: 4.5,
    images: IMAGES.footwear,
    history: [1.2, 1.15, 1.1, 1.05, 1, 1]
  },
  {
    id: 'mock-010',
    name: 'Adidas Ultraboost 22 Running Shoes (Cloud White/Core Black)',
    category: 'Footwear',
    specs: {
      brand: 'Adidas',
      type: 'Road running shoes',
      upper: 'Primeknit+',
      cushioning: 'Boost midsole',
      sole: 'Continental rubber outsole',
      weight: '310 g',
      sizes: 'UK 6 to UK 10'
    },
    currentPrice: 11999,
    mrp: 17999,
    stock: 34,
    rating: 4.6,
    images: IMAGES.footwear,
    history: [1.18, 1.12, 1.08, 0.92, 0.97, 1]
  },
  {
    id: 'mock-011',
    name: 'Puma Velocity Nitro 2 Running Shoes (Blue/White)',
    category: 'Footwear',
    specs: {
      brand: 'Puma',
      type: 'Daily trainer running shoes',
      upper: 'Breathable mesh',
      cushioning: 'Nitro foam midsole',
      sole: 'PumaGrip rubber outsole',
      weight: '265 g',
      sizes: 'UK 7 to UK 11'
    },
    currentPrice: 5999,
    mrp: 9999,
    stock: 45,
    rating: 4.3,
    images: IMAGES.footwear,
    history: [1.25, 1.18, 1.1, 1.04, 1, 1]
  },
  {
    id: 'mock-012',
    name: "Skechers D'Lux Walker Slip-On Shoes (Charcoal)",
    category: 'Footwear',
    specs: {
      brand: 'Skechers',
      type: 'Walking shoes',
      upper: 'Knit mesh fabric',
      cushioning: 'Air Cooled Memory Foam',
      sole: 'Flexible rubber outsole',
      weight: '280 g',
      sizes: 'UK 6 to UK 10'
    },
    currentPrice: 4499,
    mrp: 7499,
    stock: 62,
    rating: 4.2,
    images: IMAGES.footwear,
    history: [1.3, 1.22, 1.14, 1.06, 1, 1]
  },
  {
    id: 'mock-013',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Black)',
    category: 'Audio',
    specs: {
      brand: 'Sony',
      type: 'Over-ear headphones',
      driver: '30mm carbon fibre composite',
      battery: 'Up to 30 hours',
      connectivity: 'Bluetooth 5.2, 3.5mm jack',
      features: 'Adaptive noise cancellation, multipoint pairing',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 26990,
    mrp: 34990,
    stock: 26,
    rating: 4.7,
    images: IMAGES.audio,
    history: [1.12, 1.08, 1.04, 1.02, 1, 1]
  },
  {
    id: 'mock-014',
    name: 'boAt Rockerz 450 Pro Bluetooth Headphones (Bold Black)',
    category: 'Audio',
    specs: {
      brand: 'boAt',
      type: 'Over-ear headphones',
      driver: '40mm dynamic driver',
      battery: 'Up to 15 hours',
      connectivity: 'Bluetooth 5.0, 3.5mm jack',
      features: 'Physical noise isolation, fitted ear cushions',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 1999,
    mrp: 4990,
    stock: 85,
    rating: 4.1,
    images: IMAGES.audio,
    history: [1.35, 1.25, 1.15, 1.08, 1, 1]
  },
  {
    id: 'mock-015',
    name: 'JBL Tune 770NC Wireless Headphones (Blue)',
    category: 'Audio',
    specs: {
      brand: 'JBL',
      type: 'Over-ear headphones',
      driver: '40mm dynamic driver',
      battery: 'Up to 70 hours',
      connectivity: 'Bluetooth 5.3, 3.5mm jack',
      features: 'Adaptive noise cancellation, JBL Pure Bass',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 6499,
    mrp: 12999,
    stock: 55,
    rating: 4.3,
    images: IMAGES.audio,
    history: [1.28, 1.2, 1.12, 1.05, 1, 1]
  },
  {
    id: 'mock-016',
    name: 'Apple AirPods Pro (2nd Gen, USB-C)',
    category: 'Audio',
    specs: {
      brand: 'Apple',
      type: 'In-ear TWS earbuds',
      driver: 'Apple custom high-excursion driver',
      battery: 'Up to 30 hours with case',
      connectivity: 'Bluetooth 5.3, USB-C',
      features: 'Active noise cancellation, adaptive audio',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 19900,
    mrp: 24900,
    stock: 40,
    rating: 4.6,
    images: IMAGES.audio,
    history: [1.1, 1.06, 1.03, 0.94, 0.98, 1]
  },
  {
    id: 'mock-017',
    name: 'Apple Watch Series 9 (45mm, GPS, Midnight Aluminium Case)',
    category: 'Accessories',
    specs: {
      brand: 'Apple',
      display: '45mm Retina LTPO OLED, 2000 nits',
      processor: 'Apple S9 SiP',
      storage: '64GB',
      battery: 'Up to 18 hours',
      connectivity: 'GPS, Bluetooth 5.3, Wi-Fi 4',
      features: 'ECG, blood oxygen sensor, crash detection'
    },
    currentPrice: 41900,
    mrp: 45900,
    stock: 16,
    rating: 4.6,
    images: IMAGES.accessories,
    history: [1.08, 1.05, 1.03, 0.96, 1.01, 1]
  },
  {
    id: 'mock-018',
    name: 'Samsung Galaxy Watch6 (44mm, Bluetooth, Graphite)',
    category: 'Accessories',
    specs: {
      brand: 'Samsung',
      display: '1.5 inch Super AMOLED, 432x432',
      processor: 'Exynos W930',
      storage: '16GB',
      battery: '425mAh',
      connectivity: 'Bluetooth 5.3, Wi-Fi, NFC',
      features: 'Body composition analysis, ECG, sleep coaching'
    },
    currentPrice: 24999,
    mrp: 31999,
    stock: 21,
    rating: 4.4,
    images: IMAGES.accessories,
    history: [1.14, 1.09, 1.05, 1.02, 1, 1]
  },
  {
    id: 'mock-019',
    name: 'Anker 20000mAh 30W Power Bank (Black)',
    category: 'Accessories',
    specs: {
      brand: 'Anker',
      capacity: '20000mAh',
      output: '30W USB-C Power Delivery',
      inputs: 'USB-C and Micro USB',
      ports: '1 USB-C, 2 USB-A',
      features: 'Power IQ 3.0, pass-through charging'
    },
    currentPrice: 2299,
    mrp: 3999,
    stock: 90,
    rating: 4.5,
    images: IMAGES.accessories,
    history: [1.3, 1.22, 1.14, 1.06, 1, 1]
  },
  {
    id: 'mock-020',
    name: 'Logitech MX Master 3S Wireless Mouse (Graphite)',
    category: 'Accessories',
    specs: {
      brand: 'Logitech',
      sensor: '8K DPI optical sensor',
      battery: 'Up to 70 days on full charge',
      connectivity: 'Bluetooth Low Energy, Logi Bolt USB receiver',
      buttons: '7 programmable buttons',
      features: 'Quiet clicks, MagSpeed electromagnetic scrolling'
    },
    currentPrice: 7495,
    mrp: 9995,
    stock: 38,
    rating: 4.7,
    images: IMAGES.accessories,
    history: [1.12, 1.08, 1.04, 0.93, 0.98, 1]
  }
];

export const MOCK_PRODUCTS = PRODUCT_DEFINITIONS.map(({ history, ...product }) => {
  const priceHistory = buildPriceHistory(product.currentPrice, history);
  const prices = priceHistory.map((entry) => entry.price).concat(product.currentPrice);

  return {
    ...product,
    priceHistory,
    lowestHistoricalPrice: Math.min(...prices)
  };
});
