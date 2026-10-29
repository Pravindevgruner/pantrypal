require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Inventory = require('./src/models/Inventory');
const Address = require('./src/models/Address');
const Order = require('./src/models/Order');
const ExpiryItem = require('./src/models/ExpiryItem');
const Cart = require('./src/models/Cart');
const Wishlist = require('./src/models/Wishlist');
const Notification = require('./src/models/Notification');
const { calculateExpiryDate } = require('./src/utils/expiryCalculator');

const ATLAS_URI = process.env.MONGODB_URI || process.env.ATLAS_URI;
if (!ATLAS_URI) {
  console.error('[Atlas Seeder] Error: MONGODB_URI or ATLAS_URI environment variable required.');
  process.exit(1);
}

async function seedAtlas() {
  try {
    console.log('[Atlas Seeder] Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('[Atlas Seeder] Connected successfully!');

    console.log('[Atlas Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Inventory.deleteMany({}),
      Address.deleteMany({}),
      Order.deleteMany({}),
      ExpiryItem.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Atlas Seeder] Creating users (Admin, Customers, Delivery Partners)...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      phone: '+91 9876543210',
      role: 'ADMIN',
      isActive: true,
    });

    const customer1 = await User.create({
      name: 'Pravin Sharma',
      email: 'customer@example.com',
      password: 'password123',
      phone: '+91 9876543211',
      role: 'CUSTOMER',
      isActive: true,
    });

    const customer2 = await User.create({
      name: 'Ananya Roy',
      email: 'ananya@example.com',
      password: 'password123',
      phone: '+91 9876543214',
      role: 'CUSTOMER',
      isActive: true,
    });

    const customer3 = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'password123',
      phone: '+91 9876543215',
      role: 'CUSTOMER',
      isActive: true,
    });

    const delivery1 = await User.create({
      name: 'Delivery Partner User',
      email: 'delivery@example.com',
      password: 'password123',
      phone: '+91 9876543212',
      role: 'DELIVERY_PARTNER',
      isActive: true,
    });

    const delivery2 = await User.create({
      name: 'Ramesh Kumar (Speedy)',
      email: 'ramesh@example.com',
      password: 'password123',
      phone: '+91 9876543213',
      role: 'DELIVERY_PARTNER',
      isActive: true,
    });

    await Cart.create([
      { user: customer1._id, items: [] },
      { user: customer2._id, items: [] },
      { user: customer3._id, items: [] },
    ]);

    await Wishlist.create([
      { user: customer1._id, products: [] },
      { user: customer2._id, products: [] },
      { user: customer3._id, products: [] },
    ]);

    console.log('[Atlas Seeder] Creating 6 categories...');
    const categoriesData = [
      { name: 'Dairy & Eggs', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Fresh farm milk, organic eggs, curd & artisanal butter' },
      { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', description: 'Direct from farm hydroponic vegetables and juicy organic fruits' },
      { name: 'Bakery & Bread', slug: 'bakery-bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', description: 'Freshly baked artisanal breads, buns, croissants & sourdough' },
      { name: 'Beverages', slug: 'beverages', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80', description: 'Cold-pressed fresh juices, specialty roast coffee & sparkling waters' },
      { name: 'Staples & Grains', slug: 'staples-grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', description: 'Aged basmati rice, whole wheat flour, lentils & organic cold-pressed oils' },
      { name: 'Snacks & Munchies', slug: 'snacks-munchies', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80', description: 'Roasted gourmet nuts, artisan chips, dry fruits & nutritious seeds' },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => (catMap[c.slug] = c));

    console.log('[Atlas Seeder] Creating 12 products across categories...');
    const productsData = [
      {
        name: 'Fresh Toned Milk 1L',
        description: 'Pasteurized whole milk enriched with Vitamin A & D',
        category: catMap['dairy-eggs']._id,
        categoryName: 'Dairy & Eggs',
        brand: 'PantryPal Farm',
        price: 64,
        discountPrice: 60,
        stockQuantity: 145,
        unit: 'pack',
        weight: '1 L',
        SKU: 'MILK-TONED-1L',
        shelfLifeDays: 5,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Farm Fresh Brown Eggs (Pack of 6)',
        description: 'High-protein organic brown eggs from free-range hens',
        category: catMap['dairy-eggs']._id,
        categoryName: 'Dairy & Eggs',
        brand: 'Organic Meadows',
        price: 90,
        discountPrice: 82,
        stockQuantity: 75,
        unit: 'pack',
        weight: '6 pcs',
        SKU: 'EGGS-BROWN-6P',
        shelfLifeDays: 21,
        image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Greek Yogurt Plain 400g',
        description: 'Rich and creamy high-protein authentic Greek yogurt',
        category: catMap['dairy-eggs']._id,
        categoryName: 'Dairy & Eggs',
        brand: 'PantryPal Farm',
        price: 130,
        discountPrice: 115,
        stockQuantity: 8, // LOW STOCK (<15)
        unit: 'tub',
        weight: '400 g',
        SKU: 'YOG-GREEK-400G',
        shelfLifeDays: 14,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Organic Tomatoes (Hybrid)',
        description: 'Juicy red tomatoes sourced directly from local farmers',
        category: catMap['fruits-vegetables']._id,
        categoryName: 'Fruits & Vegetables',
        brand: 'Green Earth Harvest',
        price: 45,
        discountPrice: 38,
        stockQuantity: 190,
        unit: 'kg',
        weight: '1 kg',
        SKU: 'VEG-TOMATO-1KG',
        shelfLifeDays: 5,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Fresh Royal Gala Apples',
        description: 'Sweet, crispy, fresh red apples imported from Himachal',
        category: catMap['fruits-vegetables']._id,
        categoryName: 'Fruits & Vegetables',
        brand: 'Fresh Orchard',
        price: 180,
        discountPrice: 160,
        stockQuantity: 110,
        unit: 'kg',
        weight: '1 kg',
        SKU: 'FRUIT-APPLE-1KG',
        shelfLifeDays: 14,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Hydroponic Baby Spinach 200g',
        description: 'Pesticide-free washed baby spinach leaves packed with iron',
        category: catMap['fruits-vegetables']._id,
        categoryName: 'Fruits & Vegetables',
        brand: 'Green Earth Harvest',
        price: 70,
        discountPrice: 62,
        stockQuantity: 5, // LOW STOCK (<15)
        unit: 'pack',
        weight: '200 g',
        SKU: 'VEG-SPINACH-200G',
        shelfLifeDays: 4,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Whole Wheat Brown Bread 400g',
        description: 'Freshly baked 100% whole grain brown bread',
        category: catMap['bakery-bread']._id,
        categoryName: 'Bakery & Bread',
        brand: 'Bakers Choice',
        price: 50,
        discountPrice: 45,
        stockQuantity: 55,
        unit: 'pack',
        weight: '400 g',
        SKU: 'BAK-BREAD-400G',
        shelfLifeDays: 7,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Artisan Sourdough Loaf 500g',
        description: 'Naturally fermented rustic sourdough with crisp crust',
        category: catMap['bakery-bread']._id,
        categoryName: 'Bakery & Bread',
        brand: 'Bakers Choice',
        price: 150,
        discountPrice: 135,
        stockQuantity: 30,
        unit: 'loaf',
        weight: '500 g',
        SKU: 'BAK-SOURDOUGH-500G',
        shelfLifeDays: 6,
        image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Basmati Premium Rice 5kg',
        description: 'Extra long grain aromatic basmati rice aged for 2 years',
        category: catMap['staples-grains']._id,
        categoryName: 'Staples & Grains',
        brand: 'Royal Heritage',
        price: 650,
        discountPrice: 599,
        stockQuantity: 45,
        unit: 'pack',
        weight: '5 kg',
        SKU: 'GRAIN-RICE-5KG',
        shelfLifeDays: 365,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Fresh Cold Pressed Orange Juice 1L',
        description: '100% pure squeezed citrus oranges without preservatives',
        category: catMap['beverages']._id,
        categoryName: 'Beverages',
        brand: 'Pure Press',
        price: 140,
        discountPrice: 125,
        stockQuantity: 65,
        unit: 'bottle',
        weight: '1 L',
        SKU: 'BEV-JUICE-1L',
        shelfLifeDays: 4,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Cold Brew Arabica Coffee 250ml',
        description: 'Steeped for 18 hours smooth single-origin black coffee',
        category: catMap['beverages']._id,
        categoryName: 'Beverages',
        brand: 'Pure Press',
        price: 110,
        discountPrice: 99,
        stockQuantity: 40,
        unit: 'bottle',
        weight: '250 ml',
        SKU: 'BEV-COLDBREW-250ML',
        shelfLifeDays: 30,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Roasted Salted Almonds 200g',
        description: 'Crunchy California almonds lightly tossed with sea salt',
        category: catMap['snacks-munchies']._id,
        categoryName: 'Snacks & Munchies',
        brand: 'Nutty Delight',
        price: 240,
        discountPrice: 220,
        stockQuantity: 85,
        unit: 'pack',
        weight: '200 g',
        SKU: 'SNK-ALMOND-200G',
        shelfLifeDays: 180,
        image: 'https://images.unsplash.com/photo-1508061252966-f727f20150b4?auto=format&fit=crop&w=400&q=80',
      },
    ];

    const products = await Product.insertMany(productsData);

    console.log('[Atlas Seeder] Initializing warehouse inventory records...');
    for (const p of products) {
      await Inventory.create({
        product: p._id,
        SKU: p.SKU,
        currentQuantity: p.stockQuantity,
        minStockThreshold: 15,
        maxStockThreshold: 300,
        unit: p.unit,
      });
      await Category.findByIdAndUpdate(p.category, { $inc: { productCount: 1 } });
    }

    console.log('[Atlas Seeder] Creating customer addresses...');
    const addr1 = await Address.create({
      user: customer1._id,
      fullName: customer1.name,
      phone: customer1.phone,
      houseFlat: 'Tower 4, Flat 1202, Palm Meadows',
      street: 'Varthur Road, Whitefield',
      area: 'Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      latitude: 12.9698,
      longitude: 77.7499,
      type: 'Home',
      isDefault: true,
    });

    const addr2 = await Address.create({
      user: customer2._id,
      fullName: customer2.name,
      phone: customer2.phone,
      houseFlat: 'Plot 45, Golden Nest',
      street: 'Indiranagar 100ft Road',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      type: 'Work',
      isDefault: true,
    });

    const addr3 = await Address.create({
      user: customer3._id,
      fullName: customer3.name,
      phone: customer3.phone,
      houseFlat: 'Villa 18, Green Valley',
      street: 'Koramangala 4th Block',
      area: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
      type: 'Home',
      isDefault: true,
    });

    console.log('[Atlas Seeder] Creating 10 realistic orders across 7 days with pipeline statuses...');
    const now = new Date();
    const daysAgo = (d, hoursOffset = 10) => {
      const target = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      target.setHours(hoursOffset, 0, 0, 0);
      return target;
    };

    const pMilk = products.find((p) => p.SKU === 'MILK-TONED-1L');
    const pEggs = products.find((p) => p.SKU === 'EGGS-BROWN-6P');
    const pBread = products.find((p) => p.SKU === 'BAK-BREAD-400G');
    const pTomato = products.find((p) => p.SKU === 'VEG-TOMATO-1KG');
    const pApples = products.find((p) => p.SKU === 'FRUIT-APPLE-1KG');
    const pJuice = products.find((p) => p.SKU === 'BEV-JUICE-1L');
    const pRice = products.find((p) => p.SKU === 'GRAIN-RICE-5KG');
    const pAlmonds = products.find((p) => p.SKU === 'SNK-ALMOND-200G');
    const pYogurt = products.find((p) => p.SKU === 'YOG-GREEK-400G');
    const pSpinach = products.find((p) => p.SKU === 'VEG-SPINACH-200G');

    const ordersToCreate = [
      // Day -5 (Delivered)
      {
        orderNumber: 'PP-201840',
        customer: customer1._id,
        items: [
          { product: pMilk._id, productName: pMilk.name, productImage: pMilk.image, quantity: 2, unitPrice: pMilk.discountPrice, shelfLifeDays: pMilk.shelfLifeDays },
          { product: pBread._id, productName: pBread.name, productImage: pBread.image, quantity: 1, unitPrice: pBread.discountPrice, shelfLifeDays: pBread.shelfLifeDays },
          { product: pEggs._id, productName: pEggs.name, productImage: pEggs.image, quantity: 1, unitPrice: pEggs.discountPrice, shelfLifeDays: pEggs.shelfLifeDays },
        ],
        subtotal: 247,
        deliveryFee: 30,
        totalAmount: 277,
        paymentMethod: 'UPI',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'DELIVERED',
        deliveryPartner: delivery1._id,
        address: addr1,
        createdAt: daysAgo(5, 9),
        updatedAt: daysAgo(5, 10),
      },
      // Day -4 (Delivered)
      {
        orderNumber: 'PP-201841',
        customer: customer2._id,
        items: [
          { product: pRice._id, productName: pRice.name, productImage: pRice.image, quantity: 1, unitPrice: pRice.discountPrice, shelfLifeDays: pRice.shelfLifeDays },
          { product: pAlmonds._id, productName: pAlmonds.name, productImage: pAlmonds.image, quantity: 1, unitPrice: pAlmonds.discountPrice, shelfLifeDays: pAlmonds.shelfLifeDays },
        ],
        subtotal: 819,
        deliveryFee: 0,
        totalAmount: 819,
        paymentMethod: 'CARD',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'DELIVERED',
        deliveryPartner: delivery2._id,
        address: addr2,
        createdAt: daysAgo(4, 11),
        updatedAt: daysAgo(4, 12),
      },
      // Day -3 (Delivered)
      {
        orderNumber: 'PP-201842',
        customer: customer3._id,
        items: [
          { product: pTomato._id, productName: pTomato.name, productImage: pTomato.image, quantity: 2, unitPrice: pTomato.discountPrice, shelfLifeDays: pTomato.shelfLifeDays },
          { product: pApples._id, productName: pApples.name, productImage: pApples.image, quantity: 1, unitPrice: pApples.discountPrice, shelfLifeDays: pApples.shelfLifeDays },
          { product: pSpinach._id, productName: pSpinach.name, productImage: pSpinach.image, quantity: 2, unitPrice: pSpinach.discountPrice, shelfLifeDays: pSpinach.shelfLifeDays },
        ],
        subtotal: 360,
        deliveryFee: 30,
        totalAmount: 390,
        paymentMethod: 'UPI',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'DELIVERED',
        deliveryPartner: delivery1._id,
        address: addr3,
        createdAt: daysAgo(3, 14),
        updatedAt: daysAgo(3, 15),
      },
      // Day -2 (Delivered)
      {
        orderNumber: 'PP-201843',
        customer: customer1._id,
        items: [
          { product: pJuice._id, productName: pJuice.name, productImage: pJuice.image, quantity: 2, unitPrice: pJuice.discountPrice, shelfLifeDays: pJuice.shelfLifeDays },
          { product: pBread._id, productName: pBread.name, productImage: pBread.image, quantity: 1, unitPrice: pBread.discountPrice, shelfLifeDays: pBread.shelfLifeDays },
        ],
        subtotal: 295,
        deliveryFee: 30,
        totalAmount: 325,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'DELIVERED',
        deliveryPartner: delivery2._id,
        address: addr1,
        createdAt: daysAgo(2, 16),
        updatedAt: daysAgo(2, 17),
      },
      // Day -1 (Delivered)
      {
        orderNumber: 'PP-201844',
        customer: customer2._id,
        items: [
          { product: pMilk._id, productName: pMilk.name, productImage: pMilk.image, quantity: 3, unitPrice: pMilk.discountPrice, shelfLifeDays: pMilk.shelfLifeDays },
          { product: pEggs._id, productName: pEggs.name, productImage: pEggs.image, quantity: 2, unitPrice: pEggs.discountPrice, shelfLifeDays: pEggs.shelfLifeDays },
          { product: pYogurt._id, productName: pYogurt.name, productImage: pYogurt.image, quantity: 1, unitPrice: pYogurt.discountPrice, shelfLifeDays: pYogurt.shelfLifeDays },
        ],
        subtotal: 459,
        deliveryFee: 0,
        totalAmount: 459,
        paymentMethod: 'UPI',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'DELIVERED',
        deliveryPartner: delivery1._id,
        address: addr2,
        createdAt: daysAgo(1, 10),
        updatedAt: daysAgo(1, 11),
      },
      // Today: Delivered
      {
        orderNumber: 'PP-201845',
        customer: customer3._id,
        items: [
          { product: pApples._id, productName: pApples.name, productImage: pApples.image, quantity: 2, unitPrice: pApples.discountPrice, shelfLifeDays: pApples.shelfLifeDays },
          { product: pAlmonds._id, productName: pAlmonds.name, productImage: pAlmonds.image, quantity: 1, unitPrice: pAlmonds.discountPrice, shelfLifeDays: pAlmonds.shelfLifeDays },
        ],
        subtotal: 540,
        deliveryFee: 0,
        totalAmount: 540,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'DELIVERED',
        deliveryPartner: delivery1._id,
        address: addr3,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4h ago
        updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      // Today: OUT_FOR_DELIVERY
      {
        orderNumber: 'PP-201846',
        customer: customer1._id,
        items: [
          { product: pMilk._id, productName: pMilk.name, productImage: pMilk.image, quantity: 2, unitPrice: pMilk.discountPrice, shelfLifeDays: pMilk.shelfLifeDays },
          { product: pBread._id, productName: pBread.name, productImage: pBread.image, quantity: 1, unitPrice: pBread.discountPrice, shelfLifeDays: pBread.shelfLifeDays },
        ],
        subtotal: 165,
        deliveryFee: 30,
        totalAmount: 195,
        paymentMethod: 'UPI',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'OUT_FOR_DELIVERY',
        deliveryPartner: delivery2._id,
        address: addr1,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2h ago
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      // Today: ASSIGNED
      {
        orderNumber: 'PP-201847',
        customer: customer2._id,
        items: [
          { product: pJuice._id, productName: pJuice.name, productImage: pJuice.image, quantity: 1, unitPrice: pJuice.discountPrice, shelfLifeDays: pJuice.shelfLifeDays },
          { product: pYogurt._id, productName: pYogurt.name, productImage: pYogurt.image, quantity: 2, unitPrice: pYogurt.discountPrice, shelfLifeDays: pYogurt.shelfLifeDays },
        ],
        subtotal: 355,
        deliveryFee: 30,
        totalAmount: 385,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'ASSIGNED',
        deliveryPartner: delivery1._id,
        address: addr2,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1h ago
        updatedAt: new Date(now.getTime() - 40 * 60 * 1000),
      },
      // Today: CONFIRMED
      {
        orderNumber: 'PP-201848',
        customer: customer3._id,
        items: [
          { product: pRice._id, productName: pRice.name, productImage: pRice.image, quantity: 1, unitPrice: pRice.discountPrice, shelfLifeDays: pRice.shelfLifeDays },
        ],
        subtotal: 599,
        deliveryFee: 0,
        totalAmount: 599,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'CONFIRMED',
        deliveryPartner: null,
        address: addr3,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30m ago
        updatedAt: new Date(now.getTime() - 25 * 60 * 1000),
      },
      // Today: PLACED
      {
        orderNumber: 'PP-201849',
        customer: customer1._id,
        items: [
          { product: pEggs._id, productName: pEggs.name, productImage: pEggs.image, quantity: 1, unitPrice: pEggs.discountPrice, shelfLifeDays: pEggs.shelfLifeDays },
          { product: pTomato._id, productName: pTomato.name, productImage: pTomato.image, quantity: 1, unitPrice: pTomato.discountPrice, shelfLifeDays: pTomato.shelfLifeDays },
        ],
        subtotal: 120,
        deliveryFee: 40,
        totalAmount: 160,
        paymentMethod: 'UPI',
        paymentStatus: 'SUCCESSFUL',
        orderStatus: 'PLACED',
        deliveryPartner: null,
        address: addr1,
        createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10m ago
        updatedAt: new Date(now.getTime() - 10 * 60 * 1000),
      },
    ];

    const createdOrders = [];
    for (const o of ordersToCreate) {
      const order = await Order.create({
        ...o,
        timeline: [
          { status: 'PLACED', note: 'Order placed by customer', timestamp: o.createdAt },
          ...(o.orderStatus !== 'PLACED' ? [{ status: 'CONFIRMED', note: 'Order confirmed by store', timestamp: o.createdAt }] : []),
          ...(o.deliveryPartner ? [{ status: 'ASSIGNED', note: 'Assigned to delivery partner', timestamp: o.updatedAt }] : []),
          ...(o.orderStatus === 'OUT_FOR_DELIVERY' || o.orderStatus === 'DELIVERED' ? [{ status: 'PICKED_UP', note: 'Picked up from warehouse', timestamp: o.updatedAt }] : []),
          ...(o.orderStatus === 'OUT_FOR_DELIVERY' || o.orderStatus === 'DELIVERED' ? [{ status: 'OUT_FOR_DELIVERY', note: 'Out for fast delivery', timestamp: o.updatedAt }] : []),
          ...(o.orderStatus === 'DELIVERED' ? [{ status: 'DELIVERED', note: 'Delivered safely to doorstep', timestamp: o.updatedAt }] : []),
        ],
      });
      createdOrders.push(order);
    }

    console.log('[Atlas Seeder] Creating Smart Expiry tracking records for households...');
    const deliveredOrder1 = createdOrders[0];
    const deliveredOrder2 = createdOrders[3];

    // Expiry Item 1: Milk (Expiring in 1 day -> EXPIRING_SOON)
    const milkPurchase = daysAgo(4);
    await ExpiryItem.create({
      customerId: customer1._id,
      productId: pMilk._id,
      orderId: deliveredOrder1._id,
      productName: pMilk.name,
      productImage: pMilk.image,
      unit: pMilk.unit,
      quantity: 2,
      consumedQuantity: 1,
      discardedQuantity: 0,
      purchaseDate: milkPurchase,
      shelfLifeDays: 5,
      expiryDate: calculateExpiryDate(milkPurchase, 5),
      status: 'EXPIRING_SOON',
      remindersSent: [3, 1],
    });

    // Expiry Item 2: Spinach (Expiring tomorrow -> EXPIRING_SOON)
    const spinachPurchase = daysAgo(3);
    await ExpiryItem.create({
      customerId: customer3._id,
      productId: pSpinach._id,
      orderId: createdOrders[2]._id,
      productName: pSpinach.name,
      productImage: pSpinach.image,
      unit: pSpinach.unit,
      quantity: 2,
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: spinachPurchase,
      shelfLifeDays: 4,
      expiryDate: calculateExpiryDate(spinachPurchase, 4),
      status: 'EXPIRING_SOON',
      remindersSent: [2, 1],
    });

    // Expiry Item 3: Eggs (Fresh, 16 days left -> FRESH)
    const eggsPurchase = daysAgo(5);
    await ExpiryItem.create({
      customerId: customer1._id,
      productId: pEggs._id,
      orderId: deliveredOrder1._id,
      productName: pEggs.name,
      productImage: pEggs.image,
      unit: pEggs.unit,
      quantity: 1,
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: eggsPurchase,
      shelfLifeDays: 21,
      expiryDate: calculateExpiryDate(eggsPurchase, 21),
      status: 'FRESH',
      remindersSent: [],
    });

    // Expiry Item 4: Almonds (Fresh, 175 days left -> FRESH)
    const almondPurchase = daysAgo(4);
    await ExpiryItem.create({
      customerId: customer2._id,
      productId: pAlmonds._id,
      orderId: createdOrders[1]._id,
      productName: pAlmonds.name,
      productImage: pAlmonds.image,
      unit: pAlmonds.unit,
      quantity: 1,
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: almondPurchase,
      shelfLifeDays: 180,
      expiryDate: calculateExpiryDate(almondPurchase, 180),
      status: 'FRESH',
      remindersSent: [],
    });

    // Expiry Item 5: Juice (Expired yesterday -> EXPIRED)
    const juicePurchase = daysAgo(6);
    await ExpiryItem.create({
      customerId: customer1._id,
      productId: pJuice._id,
      orderId: deliveredOrder2._id,
      productName: pJuice.name,
      productImage: pJuice.image,
      unit: pJuice.unit,
      quantity: 1,
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: juicePurchase,
      shelfLifeDays: 4,
      expiryDate: calculateExpiryDate(juicePurchase, 4),
      status: 'EXPIRED',
      remindersSent: [3, 1, 0],
    });

    console.log('[Atlas Seeder] Creating customer notification feeds...');
    await Notification.create([
      {
        user: customer1._id,
        title: 'Order Out for Delivery! 🛵',
        message: `Order #PP-201846 is on its way with Ramesh Kumar. Arriving shortly.`,
        type: 'DELIVERY',
        referenceId: createdOrders[6]._id.toString(),
        isRead: false,
      },
      {
        user: customer1._id,
        title: 'Smart Expiry Alert ⏱️',
        message: 'Fresh Toned Milk 1L expires in 1 day. Consume soon or freeze!',
        type: 'EXPIRY',
        referenceId: pMilk._id.toString(),
        isRead: false,
      },
      {
        user: customer2._id,
        title: 'Delivery Partner Assigned 🛵',
        message: 'Delivery Partner User has been assigned to your order #PP-201847.',
        type: 'DELIVERY',
        referenceId: createdOrders[7]._id.toString(),
        isRead: false,
      },
      {
        user: customer3._id,
        title: 'Order Placed Successfully 🛍️',
        message: 'Order #PP-201848 for ₹599 has been confirmed.',
        type: 'ORDER',
        referenceId: createdOrders[8]._id.toString(),
        isRead: true,
      },
    ]);

    console.log('\n======================================================');
    console.log(' PANTRYPAL LIVE ATLAS DATABASE SEEDED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(` • Categories Created:     ${categories.length}`);
    console.log(` • Products Created:       ${products.length}`);
    console.log(` • Inventory Records:      ${products.length} (including 2 Low Stock alerts)`);
    console.log(` • Orders Seeded:          ${ordersToCreate.length} (across 6 days & today)`);
    console.log(` • Smart Expiry Items:     5 (2 FRESH, 2 EXPIRING_SOON, 1 EXPIRED)`);
    console.log(` • Users:                  Admin, 3 Customers, 2 Delivery Partners`);
    console.log('------------------------------------------------------');
    console.log(` Admin Credentials:        admin@example.com / password123`);
    console.log(` Customer Credentials:     customer@example.com / password123`);
    console.log(` Delivery Credentials:     delivery@example.com / password123`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Atlas Seeder Error]', error);
    process.exit(1);
  }
}

seedAtlas();
