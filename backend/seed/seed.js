const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

const BCRYPT_SALT_ROUNDS = 12;

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
  return date;
};

const buildPriceHistory = (currentPrice, multipliers) => multipliers.map((multiplier, index) => ({
  price: Math.round(currentPrice * multiplier),
  date: monthDate(multipliers.length - 1 - index)
}));

const PRODUCTS = [
  {
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
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 69999,
    mrp: 84999,
    stock: 24,
    rating: 4.6,
    images: IMAGES.mobiles,
    history: [1.12, 1.08, 1.05, 1.03, 1.01, 1]
  },
  {
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
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 34999,
    mrp: 42999,
    stock: 36,
    rating: 4.5,
    images: IMAGES.mobiles,
    history: [1.1, 1.06, 1.04, 0.97, 1.02, 1]
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro 5G (Aurora Purple, 256GB)',
    category: 'Mobiles',
    specs: {
      brand: 'Xiaomi',
      display: '6.67 inch AMOLED, 120Hz',
      processor: 'Snapdragon 7s Gen 2',
      ram: '8GB',
      storage: '256GB',
      camera: '200MP + 8MP + 2MP triple rear camera',
      battery: '5100mAh',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.2',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 23999,
    mrp: 28999,
    stock: 52,
    rating: 4.4,
    images: IMAGES.mobiles,
    history: [1.15, 1.1, 1.06, 1.02, 1, 1]
  },
  {
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
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 62900,
    mrp: 69900,
    stock: 18,
    rating: 4.7,
    images: IMAGES.mobiles,
    history: [1.08, 1.06, 1.03, 0.95, 0.98, 1]
  },
  {
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
      weight: '1.24 kg',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 99900,
    mrp: 114900,
    stock: 12,
    rating: 4.8,
    images: IMAGES.laptops,
    history: [1.1, 1.07, 1.04, 1.02, 1, 1]
  },
  {
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
      weight: '1.75 kg',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 58990,
    mrp: 72999,
    stock: 20,
    rating: 4.3,
    images: IMAGES.laptops,
    history: [1.12, 1.08, 1.05, 0.96, 1.01, 1]
  },
  {
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
      weight: '1.62 kg',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 64990,
    mrp: 79990,
    stock: 15,
    rating: 4.4,
    images: IMAGES.laptops,
    history: [1.09, 1.06, 1.03, 1.01, 1, 1]
  },
  {
    name: 'ASUS Vivobook 15 (Silver, Core i3 12th Gen, 8GB/512GB SSD)',
    category: 'Laptops',
    specs: {
      brand: 'ASUS',
      display: '15.6 inch Full HD LED, 250 nits',
      processor: 'Intel Core i3-1215U',
      ram: '8GB DDR4',
      storage: '512GB SSD',
      graphics: 'Intel UHD Graphics',
      battery: '50Wh',
      weight: '1.7 kg',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 38990,
    mrp: 49990,
    stock: 28,
    rating: 4.1,
    images: IMAGES.laptops,
    history: [1.14, 1.1, 1.05, 0.94, 0.98, 1]
  },
  {
    name: 'Nike Air Zoom Pegasus 40 Running Shoes (Black/White)',
    category: 'Footwear',
    specs: {
      brand: 'Nike',
      type: 'Road running shoes',
      upper: 'Engineered mesh',
      cushioning: 'ReactX foam with Zoom Air unit',
      sole: 'Rubber outsole',
      weight: '285 g',
      sizes: 'UK 6 to UK 11',
      warranty: '3 months manufacturer warranty'
    },
    currentPrice: 7495,
    mrp: 12495,
    stock: 60,
    rating: 4.5,
    images: IMAGES.footwear,
    history: [1.2, 1.15, 1.1, 1.05, 1, 1]
  },
  {
    name: 'Adidas Ultraboost 22 Running Shoes (Cloud White/Core Black)',
    category: 'Footwear',
    specs: {
      brand: 'Adidas',
      type: 'Road running shoes',
      upper: 'Primeknit+',
      cushioning: 'Boost midsole',
      sole: 'Continental rubber outsole',
      weight: '310 g',
      sizes: 'UK 6 to UK 10',
      warranty: '3 months manufacturer warranty'
    },
    currentPrice: 11999,
    mrp: 17999,
    stock: 34,
    rating: 4.6,
    images: IMAGES.footwear,
    history: [1.18, 1.12, 1.08, 0.92, 0.97, 1]
  },
  {
    name: 'Puma Velocity Nitro 2 Running Shoes (Blue/White)',
    category: 'Footwear',
    specs: {
      brand: 'Puma',
      type: 'Daily trainer running shoes',
      upper: 'Breathable mesh',
      cushioning: 'Nitro foam midsole',
      sole: 'PumaGrip rubber outsole',
      weight: '265 g',
      sizes: 'UK 7 to UK 11',
      warranty: '3 months manufacturer warranty'
    },
    currentPrice: 5999,
    mrp: 9999,
    stock: 45,
    rating: 4.3,
    images: IMAGES.footwear,
    history: [1.25, 1.18, 1.1, 1.04, 1, 1]
  },
  {
    name: 'New Balance Fresh Foam 1080v12 Running Shoes (Grey/Red)',
    category: 'Footwear',
    specs: {
      brand: 'New Balance',
      type: 'Neutral running shoes',
      upper: 'Engineered mesh',
      cushioning: 'Fresh Foam X midsole',
      sole: 'Blown rubber outsole',
      weight: '290 g',
      sizes: 'UK 6 to UK 10',
      warranty: '3 months manufacturer warranty'
    },
    currentPrice: 9299,
    mrp: 13999,
    stock: 22,
    rating: 4.4,
    images: IMAGES.footwear,
    history: [1.16, 1.1, 1.05, 0.95, 0.99, 1]
  },
  {
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
    name: 'JBL Tune 770NC Wireless Over-Ear Headphones (Blue)',
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
    name: 'boAt Airdopes 141 TWS Earbuds (Bold Black)',
    category: 'Audio',
    specs: {
      brand: 'boAt',
      type: 'In-ear TWS earbuds',
      driver: '8mm dynamic driver',
      battery: 'Up to 42 hours with case',
      connectivity: 'Bluetooth 5.1, USB-C',
      features: 'ENx environmental noise cancellation, low latency mode',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 1299,
    mrp: 4490,
    stock: 120,
    rating: 4.1,
    images: IMAGES.audio,
    history: [1.35, 1.25, 1.15, 1.08, 1, 1]
  },
  {
    name: 'Apple Watch Series 9 (45mm, GPS, Midnight Aluminium Case)',
    category: 'Accessories',
    specs: {
      brand: 'Apple',
      display: '45mm Retina LTPO OLED, 2000 nits',
      processor: 'Apple S9 SiP',
      storage: '64GB',
      battery: 'Up to 18 hours',
      connectivity: 'GPS, Bluetooth 5.3, Wi-Fi 4',
      features: 'ECG, blood oxygen sensor, crash detection',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 41900,
    mrp: 45900,
    stock: 16,
    rating: 4.6,
    images: IMAGES.accessories,
    history: [1.08, 1.05, 1.03, 0.96, 1.01, 1]
  },
  {
    name: 'Samsung Galaxy Watch6 (44mm, Bluetooth, Graphite)',
    category: 'Accessories',
    specs: {
      brand: 'Samsung',
      display: '1.5 inch Super AMOLED, 432x432',
      processor: 'Exynos W930',
      storage: '16GB',
      battery: '425mAh',
      connectivity: 'Bluetooth 5.3, Wi-Fi, NFC',
      features: 'Body composition analysis, ECG, sleep coaching',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 24999,
    mrp: 31999,
    stock: 21,
    rating: 4.4,
    images: IMAGES.accessories,
    history: [1.14, 1.09, 1.05, 1.02, 1, 1]
  },
  {
    name: 'Anker 20000mAh 30W Power Bank (A1642, Black)',
    category: 'Accessories',
    specs: {
      brand: 'Anker',
      capacity: '20000mAh',
      output: '30W USB-C Power Delivery',
      inputs: 'USB-C and Micro USB',
      ports: '1 USB-C, 2 USB-A',
      features: 'Power IQ 3.0, pass-through charging',
      warranty: '18 months manufacturer warranty'
    },
    currentPrice: 2299,
    mrp: 3999,
    stock: 90,
    rating: 4.5,
    images: IMAGES.accessories,
    history: [1.3, 1.22, 1.14, 1.06, 1, 1]
  },
  {
    name: 'Logitech MX Master 3S Wireless Performance Mouse (Graphite)',
    category: 'Accessories',
    specs: {
      brand: 'Logitech',
      sensor: '8K DPI optical sensor',
      battery: 'Up to 70 days on full charge',
      connectivity: 'Bluetooth Low Energy, Logi Bolt USB receiver',
      buttons: '7 programmable buttons',
      features: 'Quiet clicks, MagSpeed electromagnetic scrolling',
      warranty: '1 year manufacturer warranty'
    },
    currentPrice: 7495,
    mrp: 9995,
    stock: 38,
    rating: 4.7,
    images: IMAGES.accessories,
    history: [1.12, 1.08, 1.04, 0.93, 0.98, 1]
  }
];

const seedDatabase = async () => {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({})
  ]);

  const [adminPasswordHash, customerPasswordHash] = await Promise.all([
    bcrypt.hash('Admin@123', BCRYPT_SALT_ROUNDS),
    bcrypt.hash('User@123', BCRYPT_SALT_ROUNDS)
  ]);

  await User.create([
    {
      name: 'Ekart Admin',
      email: 'admin@ekart.com',
      passwordHash: adminPasswordHash,
      role: 'admin'
    },
    {
      name: 'Demo Customer',
      email: 'user@ekart.com',
      passwordHash: customerPasswordHash,
      role: 'customer'
    }
  ]);

  const products = PRODUCTS.map(({ history, ...product }) => ({
    ...product,
    priceHistory: buildPriceHistory(product.currentPrice, history)
  }));

  await Product.insertMany(products, { ordered: true });

  return {
    users: 2,
    products: products.length
  };
};

const run = async () => {
  try {
    await connectDB();
    await Promise.all([User.init(), Product.init(), Order.init(), Review.init()]);

    const result = await seedDatabase();

    console.log(`[seed] Database cleared and seeded successfully: ${result.users} users, ${result.products} products.`);
    console.log('[seed] Admin: admin@ekart.com / Admin@123');
    console.log('[seed] Customer: user@ekart.com / User@123');
  } catch (error) {
    console.error('[seed] Failed to seed database:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
