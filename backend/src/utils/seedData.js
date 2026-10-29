const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Address = require('../models/Address');
const Order = require('../models/Order');
const ExpiryItem = require('../models/ExpiryItem');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const { calculateExpiryDate } = require('./expiryCalculator');

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Resetting database collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    await Address.deleteMany({});
    await Order.deleteMany({});
    await ExpiryItem.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seeder] Creating demo users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      phone: '+91 9876543210',
      role: 'ADMIN',
    });

    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@example.com',
      password: 'password123',
      phone: '+91 9876543211',
      role: 'CUSTOMER',
    });

    const customer2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'password123',
      phone: '+91 9876543214',
      role: 'CUSTOMER',
    });

    const deliveryPartner = await User.create({
      name: 'Delivery Partner User',
      email: 'delivery@example.com',
      password: 'password123',
      phone: '+91 9876543212',
      role: 'DELIVERY_PARTNER',
    });

    const deliveryPartner2 = await User.create({
      name: 'Ramesh Kumar (Speedy)',
      email: 'ramesh@example.com',
      password: 'password123',
      phone: '+91 9876543213',
      role: 'DELIVERY_PARTNER',
    });

    await Cart.create({ user: customer._id, items: [] });
    await Cart.create({ user: customer2._id, items: [] });
    await Wishlist.create({ user: customer._id, products: [] });
    await Wishlist.create({ user: customer2._id, products: [] });

    console.log('[Seeder] Creating categories...');
    const categoriesData = [
      { name: 'Dairy & Eggs', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80', description: 'Fresh milk, butter, cheese, and farm eggs' },
      { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', description: 'Organic farm fresh fruits and green vegetables' },
      { name: 'Bakery & Bread', slug: 'bakery-bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', description: 'Artisanal breads, buns, and fresh bakes' },
      { name: 'Beverages', slug: 'beverages', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80', description: 'Cold drinks, juices, coffee, and herbal teas' },
      { name: 'Staples & Grains', slug: 'staples-grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', description: 'Rice, wheat flour, lentils, and cooking oils' },
      { name: 'Snacks & Munchies', slug: 'snacks-munchies', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80', description: 'Chips, biscuits, nuts, and healthy bites' },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => (catMap[c.slug] = c));

    console.log('[Seeder] Creating realistic products with shelf-life metrics...');
    const productsData = [
      {
        name: 'Fresh Toned Milk 1L',
        description: 'Pasteurized whole milk enriched with Vitamin A & D',
        category: catMap['dairy-eggs']._id,
        categoryName: 'Dairy & Eggs',
        brand: 'PantryPal Farm',
        price: 64,
        discountPrice: 60,
        stockQuantity: 150,
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
        stockQuantity: 80,
        unit: 'pack',
        weight: '6 pcs',
        SKU: 'EGGS-BROWN-6P',
        shelfLifeDays: 21,
        image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Organic Tomatoes (Hybrid)',
        description: 'Juicy red tomatoes sourced directly from local farmers',
        category: catMap['fruits-vegetables']._id,
        categoryName: 'Fruits & Vegetables',
        brand: 'Green Earth Harvest',
        price: 45,
        discountPrice: 38,
        stockQuantity: 200,
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
        stockQuantity: 120,
        unit: 'kg',
        weight: '1 kg',
        SKU: 'FRUIT-APPLE-1KG',
        shelfLifeDays: 14,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Whole Wheat Brown Bread 400g',
        description: 'Freshly baked 100% whole grain brown bread',
        category: catMap['bakery-bread']._id,
        categoryName: 'Bakery & Bread',
        brand: 'Bakers Choice',
        price: 50,
        discountPrice: 45,
        stockQuantity: 60,
        unit: 'pack',
        weight: '400 g',
        SKU: 'BAK-BREAD-400G',
        shelfLifeDays: 7,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Basmati Premium Rice 5kg',
        description: 'Extra long grain aromatic basmati rice aged for 2 years',
        category: catMap['staples-grains']._id,
        categoryName: 'Staples & Grains',
        brand: 'Royal Heritage',
        price: 650,
        discountPrice: 599,
        stockQuantity: 50,
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
        stockQuantity: 75,
        unit: 'bottle',
        weight: '1 L',
        SKU: 'BEV-JUICE-1L',
        shelfLifeDays: 4,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Roasted Salted Almonds 200g',
        description: 'Crunchy California almonds lightly tossed with sea salt',
        category: catMap['snacks-munchies']._id,
        categoryName: 'Snacks & Munchies',
        brand: 'Nutty Delight',
        price: 240,
        discountPrice: 220,
        stockQuantity: 90,
        unit: 'pack',
        weight: '200 g',
        SKU: 'SNK-ALMOND-200G',
        shelfLifeDays: 180,
        image: 'https://images.unsplash.com/photo-1508061252966-f727f20150b4?auto=format&fit=crop&w=400&q=80',
      },
    ];

    const products = await Product.insertMany(productsData);

    // Create Inventory for each product
    for (const p of products) {
      await Inventory.create({
        product: p._id,
        SKU: p.SKU,
        currentQuantity: p.stockQuantity,
        minStockThreshold: 15,
        maxStockThreshold: 300,
        unit: p.unit,
      });

      // Update category product counts
      await Category.findByIdAndUpdate(p.category, { $inc: { productCount: 1 } });
    }

    console.log('[Seeder] Creating customer address...');
    const address = await Address.create({
      user: customer._id,
      fullName: 'Customer User',
      phone: '+91 9876543211',
      houseFlat: 'Flat 402, Sunshine Apartments',
      street: 'Green Avenue, Block C',
      area: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      latitude: 28.6139,
      longitude: 77.2090,
      type: 'Home',
      isDefault: true,
    });

    console.log('[Seeder] Creating sample delivered order & Smart Expiry records...');
    const sampleMilk = products.find((p) => p.SKU === 'MILK-TONED-1L');
    const sampleBread = products.find((p) => p.SKU === 'BAK-BREAD-400G');
    const sampleTomato = products.find((p) => p.SKU === 'VEG-TOMATO-1KG');

    const sampleOrder = await Order.create({
      orderNumber: 'PP-100852',
      customer: customer._id,
      items: [
        { product: sampleMilk._id, productName: sampleMilk.name, productImage: sampleMilk.image, quantity: 2, unitPrice: sampleMilk.discountPrice, shelfLifeDays: sampleMilk.shelfLifeDays },
        { product: sampleBread._id, productName: sampleBread.name, productImage: sampleBread.image, quantity: 1, unitPrice: sampleBread.discountPrice, shelfLifeDays: sampleBread.shelfLifeDays },
        { product: sampleTomato._id, productName: sampleTomato.name, productImage: sampleTomato.image, quantity: 1, unitPrice: sampleTomato.discountPrice, shelfLifeDays: sampleTomato.shelfLifeDays },
      ],
      address: {
        fullName: address.fullName,
        phone: address.phone,
        houseFlat: address.houseFlat,
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      subtotal: 203,
      discount: 0,
      deliveryFee: 30,
      totalAmount: 233,
      paymentMethod: 'UPI',
      paymentStatus: 'SUCCESSFUL',
      orderStatus: 'DELIVERED',
      deliveryPartner: deliveryPartner._id,
      timeline: [
        { status: 'PLACED', note: 'Order placed' },
        { status: 'CONFIRMED', note: 'Order confirmed' },
        { status: 'ASSIGNED', note: 'Assigned to delivery partner' },
        { status: 'PICKED_UP', note: 'Picked up from warehouse' },
        { status: 'OUT_FOR_DELIVERY', note: 'Out for delivery' },
        { status: 'DELIVERED', note: 'Order delivered' },
      ],
    });

    // Populate Expiry Items for customer (Fresh, Expiring Soon, Expired samples)
    const now = new Date();

    // 1. Milk (Expiring in 2 days -> EXPIRING_SOON)
    const milkPurchase = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    await ExpiryItem.create({
      customerId: customer._id,
      productId: sampleMilk._id,
      orderId: sampleOrder._id,
      productName: sampleMilk.name,
      productImage: sampleMilk.image,
      unit: sampleMilk.unit,
      quantity: 2,
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: milkPurchase,
      shelfLifeDays: 5,
      expiryDate: calculateExpiryDate(milkPurchase, 5),
      status: 'EXPIRING_SOON',
      remindersSent: [3],
    });

    // 2. Bread (Expiring in 5 days -> FRESH)
    const breadPurchase = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    await ExpiryItem.create({
      customerId: customer._id,
      productId: sampleBread._id,
      orderId: sampleOrder._id,
      productName: sampleBread.name,
      productImage: sampleBread.image,
      unit: sampleBread.unit,
      quantity: 1,
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: breadPurchase,
      shelfLifeDays: 7,
      expiryDate: calculateExpiryDate(breadPurchase, 7),
      status: 'FRESH',
      remindersSent: [],
    });

    // 3. Cold Pressed Juice (Expired 1 day ago -> EXPIRED)
    const juiceItem = products.find((p) => p.SKU === 'BEV-JUICE-1L');
    const juicePurchase = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago (shelf life 4 days)
    await ExpiryItem.create({
      customerId: customer._id,
      productId: juiceItem._id,
      orderId: sampleOrder._id,
      productName: juiceItem.name,
      productImage: juiceItem.image,
      unit: juiceItem.unit,
      quantity: 1,
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: juicePurchase,
      shelfLifeDays: 4,
      expiryDate: calculateExpiryDate(juicePurchase, 4),
      status: 'EXPIRED',
      remindersSent: [3, 1, 0],
    });

    console.log('[Seeder] Seeding initial notifications for demo customer...');
    await Notification.create([
      {
        user: customer._id,
        title: 'Order Placed! 🛍️',
        message: `Order #${sampleOrder.orderNumber} for ₹${sampleOrder.totalAmount} has been confirmed. Fresh groceries packed with care!`,
        type: 'ORDER',
        referenceId: sampleOrder._id.toString(),
        isRead: false,
      },
      {
        user: customer._id,
        title: 'Payment Successful 💳',
        message: `Payment of ₹${sampleOrder.totalAmount} received via ${sampleOrder.paymentMethod}. Transaction recorded.`,
        type: 'PAYMENT',
        referenceId: sampleOrder._id.toString(),
        isRead: false,
      },
      {
        user: customer._id,
        title: 'Delivery Partner Assigned 🛵',
        message: `${deliveryPartner.name} has been assigned to deliver your order. Tracking is active.`,
        type: 'DELIVERY',
        referenceId: sampleOrder._id.toString(),
        isRead: false,
      },
      {
        user: customer._id,
        title: 'Smart Expiry Warning ⏱️',
        message: 'Organic Farm Fresh Milk expires in 2 days. Consume soon or freeze to prevent food waste!',
        type: 'EXPIRY',
        referenceId: sampleMilk._id.toString(),
        isRead: false,
      },
      {
        user: customer._id,
        title: 'Weekend Flash Offer! 🏷️',
        message: 'Get 25% OFF on all fresh bakery items and cold juices. Use code FRESH25 at checkout!',
        type: 'PROMO',
        referenceId: 'PROMO_FRESH25',
        isRead: true,
      },
    ]);

    console.log('[Seeder] Database successfully seeded!');
    return {
      adminEmail: admin.email,
      customerEmail: customer.email,
      deliveryEmail: deliveryPartner.email,
      password: 'password123',
    };
  } catch (error) {
    console.error('[Seeder Error]', error);
    throw error;
  }
};

module.exports = { seedDatabase };
