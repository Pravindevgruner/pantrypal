import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for persistent local mock state
const KEYS = {
  USERS: '@pantrypal_mock_users_v1',
  ORDERS: '@pantrypal_mock_orders_v1',
  EXPIRY: '@pantrypal_mock_expiry_v1',
  PRODUCTS: '@pantrypal_mock_products_v1',
  WISHLIST: '@pantrypal_mock_wishlist_v1',
  ADDRESSES: '@pantrypal_mock_addresses_v1',
  NOTIFICATIONS: '@pantrypal_mock_notifications_v1',
};

// 1. Initial Mock Categories
export const INITIAL_CATEGORIES = [
  {
    _id: 'cat_dairy_1',
    id: 'cat_dairy_1',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh milk, butter, cheese, and farm eggs',
    productCount: 2,
    isActive: true,
  },
  {
    _id: 'cat_fruits_2',
    id: 'cat_fruits_2',
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    description: 'Organic farm fresh fruits and green vegetables',
    productCount: 2,
    isActive: true,
  },
  {
    _id: 'cat_bakery_3',
    id: 'cat_bakery_3',
    name: 'Bakery & Bread',
    slug: 'bakery-bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Artisanal breads, buns, and fresh bakes',
    productCount: 1,
    isActive: true,
  },
  {
    _id: 'cat_bev_4',
    id: 'cat_bev_4',
    name: 'Beverages',
    slug: 'beverages',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
    description: 'Cold drinks, juices, coffee, and herbal teas',
    productCount: 1,
    isActive: true,
  },
  {
    _id: 'cat_staples_5',
    id: 'cat_staples_5',
    name: 'Staples & Grains',
    slug: 'staples-grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    description: 'Rice, wheat flour, lentils, and cooking oils',
    productCount: 1,
    isActive: true,
  },
  {
    _id: 'cat_snacks_6',
    id: 'cat_snacks_6',
    name: 'Snacks & Munchies',
    slug: 'snacks-munchies',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80',
    description: 'Chips, biscuits, nuts, and healthy bites',
    productCount: 1,
    isActive: true,
  },
];

// 2. Initial Mock Products with Shelf Life
export const INITIAL_PRODUCTS = [
  {
    _id: 'prod_milk_1',
    id: 'prod_milk_1',
    name: 'Fresh Toned Milk 1L',
    description: 'Pasteurized whole milk enriched with Vitamin A & D. Farm fresh and cold stored.',
    category: 'cat_dairy_1',
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
    isAvailable: true,
  },
  {
    _id: 'prod_eggs_2',
    id: 'prod_eggs_2',
    name: 'Farm Fresh Brown Eggs (Pack of 6)',
    description: 'High-protein organic brown eggs from free-range hens.',
    category: 'cat_dairy_1',
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
    isAvailable: true,
  },
  {
    _id: 'prod_tomatoes_3',
    id: 'prod_tomatoes_3',
    name: 'Organic Tomatoes (Hybrid)',
    description: 'Juicy red tomatoes sourced directly from local farmers.',
    category: 'cat_fruits_2',
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
    isAvailable: true,
  },
  {
    _id: 'prod_apples_4',
    id: 'prod_apples_4',
    name: 'Fresh Royal Gala Apples',
    description: 'Sweet, crispy, fresh red apples imported from Himachal.',
    category: 'cat_fruits_2',
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
    isAvailable: true,
  },
  {
    _id: 'prod_bread_5',
    id: 'prod_bread_5',
    name: 'Whole Wheat Brown Bread 400g',
    description: 'Freshly baked 100% whole grain brown bread, low in carbs.',
    category: 'cat_bakery_3',
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
    isAvailable: true,
  },
  {
    _id: 'prod_rice_6',
    id: 'prod_rice_6',
    name: 'Basmati Premium Rice 5kg',
    description: 'Extra long grain aromatic basmati rice aged for 2 years.',
    category: 'cat_staples_5',
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
    isAvailable: true,
  },
  {
    _id: 'prod_juice_7',
    id: 'prod_juice_7',
    name: 'Fresh Cold Pressed Orange Juice 1L',
    description: '100% pure squeezed citrus oranges without preservatives.',
    category: 'cat_bev_4',
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
    isAvailable: true,
  },
  {
    _id: 'prod_almonds_8',
    id: 'prod_almonds_8',
    name: 'Roasted Salted Almonds 200g',
    description: 'Crunchy California almonds lightly tossed with sea salt.',
    category: 'cat_snacks_6',
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
    isAvailable: true,
  },
];

// Helper: Calculate Expiry & Status
export const computeExpiryMeta = (purchasedDateStr, shelfLifeDays) => {
  const pDate = new Date(purchasedDateStr || Date.now());
  const expDate = new Date(pDate.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status = 'FRESH';
  if (diffDays < 0) {
    status = 'EXPIRED';
  } else if (diffDays <= 3) {
    status = 'EXPIRING_SOON';
  }

  return {
    purchaseDate: pDate.toISOString(),
    purchasedDate: pDate.toISOString(),
    expiryDate: expDate.toISOString(),
    estimatedExpiryDate: expDate.toISOString(),
    daysRemaining: diffDays,
    status,
  };
};

// Initial Sample Household Pantry & Expiry Items
const createInitialExpiryItems = () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const item1Dates = computeExpiryMeta(new Date(now - 3 * dayMs), 5); // 2 days left -> EXPIRING_SOON
  const item2Dates = computeExpiryMeta(new Date(now - 2 * dayMs), 21); // 19 days left -> FRESH
  const item3Dates = computeExpiryMeta(new Date(now - 5 * dayMs), 7); // 2 days left -> EXPIRING_SOON
  const item4Dates = computeExpiryMeta(new Date(now - 1 * dayMs), 5); // 4 days left -> FRESH
  const item5Dates = computeExpiryMeta(new Date(now - 5 * dayMs), 4); // -1 days -> EXPIRED

  return [
    {
      _id: 'exp_item_1',
      id: 'exp_item_1',
      productName: 'Fresh Toned Milk 1L',
      itemName: 'Fresh Toned Milk 1L',
      category: 'Dairy & Eggs',
      quantity: 2,
      unit: 'pack',
      shelfLifeDays: 5,
      location: 'Fridge',
      storageLocation: 'Fridge',
      ...item1Dates,
    },
    {
      _id: 'exp_item_2',
      id: 'exp_item_2',
      productName: 'Farm Fresh Brown Eggs (Pack of 6)',
      itemName: 'Farm Fresh Brown Eggs (Pack of 6)',
      category: 'Dairy & Eggs',
      quantity: 1,
      unit: 'pack',
      shelfLifeDays: 21,
      location: 'Fridge',
      storageLocation: 'Fridge',
      ...item2Dates,
    },
    {
      _id: 'exp_item_3',
      id: 'exp_item_3',
      productName: 'Whole Wheat Brown Bread 400g',
      itemName: 'Whole Wheat Brown Bread 400g',
      category: 'Bakery & Bread',
      quantity: 1,
      unit: 'pack',
      shelfLifeDays: 7,
      location: 'Pantry',
      storageLocation: 'Pantry',
      ...item3Dates,
    },
    {
      _id: 'exp_item_4',
      id: 'exp_item_4',
      productName: 'Organic Tomatoes (Hybrid)',
      itemName: 'Organic Tomatoes (Hybrid)',
      category: 'Fruits & Vegetables',
      quantity: 1,
      unit: 'kg',
      shelfLifeDays: 5,
      location: 'Fridge',
      storageLocation: 'Fridge',
      ...item4Dates,
    },
    {
      _id: 'exp_item_5',
      id: 'exp_item_5',
      productName: 'Fresh Cold Pressed Orange Juice 1L',
      itemName: 'Fresh Cold Pressed Orange Juice 1L',
      category: 'Beverages',
      quantity: 1,
      unit: 'bottle',
      shelfLifeDays: 4,
      location: 'Fridge',
      storageLocation: 'Fridge',
      ...item5Dates,
    },
  ];
};

// Initial Sample Orders
const createInitialOrders = () => {
  return [
    {
      _id: 'order_100852',
      id: 'order_100852',
      orderNumber: 'PP-100852',
      status: 'DELIVERED',
      orderStatus: 'DELIVERED',
      paymentMethod: 'RAZORPAY_UPI',
      paymentStatus: 'PAID',
      subtotal: 187,
      deliveryFee: 20,
      totalAmount: 207,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          productName: 'Fresh Toned Milk 1L',
          productImage: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
          quantity: 2,
          unitPrice: 60,
          shelfLifeDays: 5,
        },
        {
          productName: 'Whole Wheat Brown Bread 400g',
          productImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          unitPrice: 45,
          shelfLifeDays: 7,
        },
      ],
      address: {
        fullName: 'Customer User',
        phone: '+91 9876543211',
        houseFlat: 'Flat 402, Sunshine Apartments',
        street: 'Green Avenue, Block C',
        city: 'New Delhi',
        pincode: '110001',
        type: 'Home',
      },
    },
    {
      _id: 'order_100914',
      id: 'order_100914',
      orderNumber: 'PP-100914',
      status: 'OUT_FOR_DELIVERY',
      orderStatus: 'OUT_FOR_DELIVERY',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      subtotal: 242,
      deliveryFee: 20,
      totalAmount: 262,
      createdAt: new Date().toISOString(),
      items: [
        {
          productName: 'Farm Fresh Brown Eggs (Pack of 6)',
          productImage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          unitPrice: 82,
          shelfLifeDays: 21,
        },
        {
          productName: 'Fresh Royal Gala Apples',
          productImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          unitPrice: 160,
          shelfLifeDays: 14,
        },
      ],
      address: {
        fullName: 'Customer User',
        phone: '+91 9876543211',
        houseFlat: 'Flat 402, Sunshine Apartments',
        street: 'Green Avenue, Block C',
        city: 'New Delhi',
        pincode: '110001',
        type: 'Home',
      },
    },
  ];
};

// ==============================================================
// PERSISTENT MOCK STORAGE CONTROLLER
// ==============================================================
class MockStorageService {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      const expStored = await AsyncStorage.getItem(KEYS.EXPIRY);
      if (!expStored) {
        await AsyncStorage.setItem(KEYS.EXPIRY, JSON.stringify(createInitialExpiryItems()));
      }

      const ordersStored = await AsyncStorage.getItem(KEYS.ORDERS);
      if (!ordersStored) {
        await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(createInitialOrders()));
      }

      this.initialized = true;
    } catch (e) {
      console.warn('MockStorage init fallback:', e);
    }
  }

  // --- PRODUCTS & CATEGORIES ---
  async getProducts(params = {}) {
    let prods = [...INITIAL_PRODUCTS];
    if (params.category) {
      prods = prods.filter(
        (p) => p.category === params.category || p.categoryName === params.category
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }
    return prods;
  }

  async getProductById(id) {
    return INITIAL_PRODUCTS.find((p) => p._id === id || p.id === id) || INITIAL_PRODUCTS[0];
  }

  async getCategories() {
    return INITIAL_CATEGORIES;
  }

  // --- EXPIRY & HOUSEHOLD PANTRY ---
  async getExpiryItems() {
    await this.init();
    try {
      const stored = await AsyncStorage.getItem(KEYS.EXPIRY);
      let list = stored ? JSON.parse(stored) : createInitialExpiryItems();
      // Dynamically refresh daysRemaining and status
      list = list.map((item) => {
        if (item.status === 'CONSUMED' || item.status === 'DISCARDED') return item;
        const meta = computeExpiryMeta(item.purchasedDate || item.purchaseDate, item.shelfLifeDays || 7);
        return { ...item, ...meta };
      });
      return list;
    } catch (e) {
      return createInitialExpiryItems();
    }
  }

  async getExpiringSoon() {
    const all = await this.getExpiryItems();
    return all.filter((i) => i.status === 'EXPIRING_SOON');
  }

  async addExpiryItem(itemData) {
    await this.init();
    const list = await this.getExpiryItems();
    const shelfLife = parseInt(itemData.shelfLifeDays, 10) || 7;
    const meta = computeExpiryMeta(itemData.purchasedDate || new Date().toISOString(), shelfLife);

    const newItem = {
      _id: `exp_local_${Date.now()}`,
      id: `exp_local_${Date.now()}`,
      productName: itemData.itemName || itemData.productName || 'Grocery Item',
      itemName: itemData.itemName || itemData.productName || 'Grocery Item',
      category: itemData.category || 'Pantry',
      quantity: parseFloat(itemData.quantity) || 1,
      unit: itemData.unit || 'unit',
      shelfLifeDays: shelfLife,
      location: itemData.location || itemData.storageLocation || 'Fridge',
      storageLocation: itemData.location || itemData.storageLocation || 'Fridge',
      ...meta,
    };

    list.unshift(newItem);
    await AsyncStorage.setItem(KEYS.EXPIRY, JSON.stringify(list));
    return newItem;
  }

  async markConsumed(id, quantity = 1) {
    await this.init();
    const list = await this.getExpiryItems();
    const target = list.find((i) => i._id === id || i.id === id);
    if (target) {
      target.status = 'CONSUMED';
      target.consumedAt = new Date().toISOString();
      await AsyncStorage.setItem(KEYS.EXPIRY, JSON.stringify(list));
    }
    return target || { success: true };
  }

  async markDiscarded(id, reason = 'Expired') {
    await this.init();
    const list = await this.getExpiryItems();
    const target = list.find((i) => i._id === id || i.id === id);
    if (target) {
      target.status = 'DISCARDED';
      target.discardReason = reason;
      target.discardedAt = new Date().toISOString();
      await AsyncStorage.setItem(KEYS.EXPIRY, JSON.stringify(list));
    }
    return target || { success: true };
  }

  async deleteExpiryItem(id) {
    await this.init();
    let list = await this.getExpiryItems();
    list = list.filter((i) => i._id !== id && i.id !== id);
    await AsyncStorage.setItem(KEYS.EXPIRY, JSON.stringify(list));
    return { success: true };
  }

  async runExpiryScan() {
    const list = await this.getExpiryItems();
    let expiringCount = 0;
    let expiredCount = 0;
    list.forEach((i) => {
      if (i.status === 'EXPIRING_SOON') expiringCount++;
      if (i.status === 'EXPIRED') expiredCount++;
    });
    return {
      success: true,
      processedCount: list.length,
      scanned: list.length,
      expiringCount,
      expiredCount,
    };
  }

  // --- ORDERS & CHECKOUT ---
  async getOrders() {
    await this.init();
    try {
      const stored = await AsyncStorage.getItem(KEYS.ORDERS);
      return stored ? JSON.parse(stored) : createInitialOrders();
    } catch (e) {
      return createInitialOrders();
    }
  }

  async getOrderById(id) {
    const orders = await this.getOrders();
    return orders.find((o) => o._id === id || o.id === id || o.orderNumber === id) || orders[0];
  }

  async createOrder(orderData) {
    await this.init();
    const orders = await this.getOrders();
    const newOrderNumber = `PP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      _id: `ord_local_${Date.now()}`,
      id: `ord_local_${Date.now()}`,
      orderNumber: newOrderNumber,
      status: 'CONFIRMED',
      orderStatus: 'CONFIRMED',
      items: orderData.items || [],
      address: orderData.address || {
        fullName: 'Customer User',
        phone: '+91 9876543211',
        street: '12th Cross, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        type: 'Home',
      },
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 20,
      totalAmount: orderData.totalAmount || orderData.subtotal || 100,
      paymentMethod: orderData.paymentMethod || 'RAZORPAY_UPI',
      paymentStatus: orderData.paymentStatus || 'PAID',
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    // Automatically sync purchased items into Household Pantry & Smart Expiry
    if (Array.isArray(orderData.items) && orderData.items.length > 0) {
      for (const item of orderData.items) {
        const pObj = item.product || item;
        const shelfDays = pObj.shelfLifeDays || item.shelfLifeDays || 7;
        await this.addExpiryItem({
          itemName: pObj.name || item.productName || 'Grocery Item',
          category: pObj.categoryName || 'Dairy & Groceries',
          quantity: item.quantity || 1,
          unit: pObj.unit || 'pack',
          shelfLifeDays: shelfDays,
          location: 'Fridge',
        });
      }
    }

    return newOrder;
  }

  async updateOrderStatus(orderId, newStatus) {
    await this.init();
    const orders = await this.getOrders();
    const target = orders.find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
    if (target) {
      target.status = newStatus;
      target.orderStatus = newStatus;
      await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
    return target || { success: true, status: newStatus };
  }

  async getDeliveryOrders() {
    let orders = await this.getOrders();
    const hasActive = orders.some((o) => {
      const st = (o.orderStatus || o.status || '').toUpperCase();
      return ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(st);
    });

    if (!hasActive) {
      const sampleActiveOrder = {
        _id: 'ord_active_partner_1',
        id: 'ord_active_partner_1',
        orderNumber: 'PP-294810',
        status: 'CONFIRMED',
        orderStatus: 'CONFIRMED',
        paymentMethod: 'ONLINE',
        paymentStatus: 'PAID',
        subtotal: 187,
        deliveryFee: 20,
        totalAmount: 207,
        createdAt: new Date().toISOString(),
        items: [
          {
            productName: 'Fresh Toned Milk 1L',
            quantity: 2,
            unitPrice: 60,
            shelfLifeDays: 5,
          },
          {
            productName: 'Whole Wheat Brown Bread 400g',
            quantity: 1,
            unitPrice: 45,
            shelfLifeDays: 7,
          },
        ],
        address: {
          fullName: 'Priya Sharma',
          phone: '+91 9876543210',
          houseFlat: 'Flat 402, Sunshine Apartments',
          street: '12th Cross, Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          type: 'Home',
        },
      };
      orders.unshift(sampleActiveOrder);
      await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
    return orders;
  }

  async acceptDeliveryOrder(orderId) {
    return this.updateOrderStatus(orderId, 'CONFIRMED');
  }

  async rejectDeliveryOrder(orderId) {
    return this.updateOrderStatus(orderId, 'PLACED');
  }

  async getDeliveryHistory() {
    const orders = await this.getOrders();
    return orders.filter((o) => (o.orderStatus || o.status) === 'DELIVERED');
  }

  // --- AUTHENTICATION FALLBACK ---
  async mockLogin(email, password) {
    const normalizedEmail = (email || '').toLowerCase().trim();

    let userRole = 'CUSTOMER';
    let userName = 'Customer User';
    let userPhone = '+91 9876543211';

    if (normalizedEmail.includes('admin')) {
      userRole = 'ADMIN';
      userName = 'Admin Manager';
      userPhone = '+91 9876543210';
    } else if (normalizedEmail.includes('delivery')) {
      userRole = 'DELIVERY_PARTNER';
      userName = 'Express Delivery Partner';
      userPhone = '+91 9876543212';
    }

    const mockUser = {
      _id: `user_${userRole.toLowerCase()}_local`,
      id: `user_${userRole.toLowerCase()}_local`,
      name: userName,
      email: normalizedEmail || 'customer@example.com',
      role: userRole,
      phone: userPhone,
    };

    const mockToken = `mock_jwt_token_${Date.now()}`;
    return { token: mockToken, user: mockUser };
  }

  async mockRegister(userData) {
    const mockUser = {
      _id: `user_reg_${Date.now()}`,
      id: `user_reg_${Date.now()}`,
      name: userData.name || 'PantryPal Member',
      email: (userData.email || 'customer@example.com').toLowerCase().trim(),
      role: userData.role || 'CUSTOMER',
      phone: userData.phone || '+91 9876543211',
    };
    const mockToken = `mock_jwt_token_${Date.now()}`;
    return { token: mockToken, user: mockUser };
  }

  // --- WISHLIST FALLBACK ---
  async getWishlist() {
    try {
      const stored = await AsyncStorage.getItem(KEYS.WISHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  async addToWishlist(product) {
    const list = await this.getWishlist();
    const pid = product._id || product.id;
    if (!list.some((p) => (p._id || p.id) === pid)) {
      list.push(product);
      await AsyncStorage.setItem(KEYS.WISHLIST, JSON.stringify(list));
    }
    return list;
  }

  async removeFromWishlist(productId) {
    let list = await this.getWishlist();
    list = list.filter((p) => (p._id || p.id) !== productId);
    await AsyncStorage.setItem(KEYS.WISHLIST, JSON.stringify(list));
    return list;
  }

  async isInWishlist(productId) {
    const list = await this.getWishlist();
    return list.some((p) => (p._id || p.id) === productId);
  }

  // --- ADDRESSES FALLBACK ---
  async getAddresses() {
    try {
      const stored = await AsyncStorage.getItem(KEYS.ADDRESSES);
      if (stored) return JSON.parse(stored);
      const defaults = [
        {
          _id: 'addr_home_1',
          id: 'addr_home_1',
          fullName: 'Customer User',
          phone: '+91 9876543211',
          houseFlat: 'Flat 402, Green Heights',
          street: '12th Cross Road',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          type: 'Home',
          isDefault: true,
        },
        {
          _id: 'addr_work_2',
          id: 'addr_work_2',
          fullName: 'Customer User',
          phone: '+91 9876543211',
          houseFlat: 'Unit 5B, Tech Park',
          street: 'Outer Ring Road',
          area: 'Bellandur',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          type: 'Work',
          isDefault: false,
        },
      ];
      await AsyncStorage.setItem(KEYS.ADDRESSES, JSON.stringify(defaults));
      return defaults;
    } catch (e) {
      return [];
    }
  }

  async createAddress(addressData) {
    const list = await this.getAddresses();
    if (addressData.isDefault) {
      list.forEach((a) => (a.isDefault = false));
    }
    const newAddress = {
      _id: `addr_${Date.now()}`,
      id: `addr_${Date.now()}`,
      ...addressData,
      isDefault: addressData.isDefault || list.length === 0,
    };
    list.unshift(newAddress);
    await AsyncStorage.setItem(KEYS.ADDRESSES, JSON.stringify(list));
    return newAddress;
  }

  async updateAddress(id, data) {
    const list = await this.getAddresses();
    const idx = list.findIndex((a) => a._id === id || a.id === id);
    if (idx > -1) {
      if (data.isDefault) {
        list.forEach((a) => (a.isDefault = false));
      }
      list[idx] = { ...list[idx], ...data };
      await AsyncStorage.setItem(KEYS.ADDRESSES, JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  async deleteAddress(id) {
    let list = await this.getAddresses();
    list = list.filter((a) => a._id !== id && a.id !== id);
    if (list.length > 0 && !list.some((a) => a.isDefault)) {
      list[0].isDefault = true;
    }
    await AsyncStorage.setItem(KEYS.ADDRESSES, JSON.stringify(list));
    return true;
  }

  // --- NOTIFICATIONS FALLBACK ---
  async getNotifications() {
    try {
      const stored = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
      const defaults = [
        {
          _id: 'notif_1',
          id: 'notif_1',
          title: 'Order Placed! 🛍️',
          message: 'Your order #PP-482910 has been confirmed. Fresh groceries being packed at the nearest hub.',
          type: 'ORDER',
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          _id: 'notif_2',
          id: 'notif_2',
          title: 'Payment Confirmed 💳',
          message: 'Payment of ₹365 received via UPI. Invoice is ready to download.',
          type: 'PAYMENT',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          _id: 'notif_3',
          id: 'notif_3',
          title: 'Smart Expiry Alert ⏱️',
          message: 'Fresh Toned Milk expires in 2 days. Consume soon or freeze to prevent waste!',
          type: 'EXPIRY',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        {
          _id: 'notif_4',
          id: 'notif_4',
          title: 'Delivery Partner Assigned 🛵',
          message: 'Rajesh Kumar is on the way to Indiranagar hub to pick up your order.',
          type: 'DELIVERY',
          isRead: true,
          createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        },
        {
          _id: 'notif_5',
          id: 'notif_5',
          title: 'Weekend Flash Offer! 🏷️',
          message: 'Save 20% on fresh bakery & dairy items with promo code PANTRY20.',
          type: 'PROMO',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
      ];
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(defaults));
      return defaults;
    } catch (e) {
      return [];
    }
  }

  async markNotificationAsRead(id) {
    const list = await this.getNotifications();
    const target = list.find((n) => n._id === id || n.id === id);
    if (target) {
      target.isRead = true;
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
    return target;
  }

  async markAllNotificationsAsRead() {
    const list = await this.getNotifications();
    list.forEach((n) => (n.isRead = true));
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    return list;
  }

  // --- ORDER CANCELLATION & INVOICE ---
  async cancelOrder(orderId) {
    const orders = await this.getOrders();
    const target = orders.find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
    if (target) {
      target.status = 'CANCELLED';
      target.orderStatus = 'CANCELLED';
      await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
    return target || { success: true };
  }

  async getOrderInvoice(orderId) {
    const order = await this.getOrderById(orderId);
    const invoiceNumber = `INV-${order.orderNumber || orderId.slice(-6).toUpperCase()}`;
    const invoiceDate = order.createdAt || new Date().toISOString();

    const items = (order.items || []).map((it, idx) => ({
      srNo: idx + 1,
      name: it.productName || it.name || it.product?.name || 'Fresh Grocery Item',
      hsn: '04012000',
      quantity: it.quantity || 1,
      unitPrice: it.unitPrice || it.price || 50,
      itemTotal: (it.unitPrice || it.price || 50) * (it.quantity || 1),
    }));

    const totalAmount = order.totalAmount || 100;
    const netTaxableAmount = Math.round(totalAmount / 1.05);
    const taxAmount = totalAmount - netTaxableAmount;

    return {
      invoiceNumber,
      invoiceDate,
      orderNumber: order.orderNumber || order._id,
      seller: {
        legalName: 'PantryPal Retail Logistics Private Limited',
        brandName: 'PantryPal Supermarket',
        gstin: '29AABCP1345L1Z8',
        fssaiLicense: '11223334000192',
        hubAddress: 'Hub 12, Indiranagar Logistics Cluster, Bengaluru - 560038',
      },
      customer: {
        name: order.address?.fullName || 'Customer User',
        phone: order.address?.phone || '+91 9876543211',
        shippingAddress: `${order.address?.houseFlat || ''} ${order.address?.street || ''}, ${order.address?.city || 'Bengaluru'} - ${order.address?.pincode || '560038'}`,
      },
      payment: {
        method: order.paymentMethod || 'Razorpay / UPI',
        status: order.paymentStatus || 'PAID',
      },
      items,
      pricing: {
        subtotal: order.subtotal || totalAmount,
        discount: order.discount || 0,
        deliveryFee: order.deliveryFee || 0,
        taxAmount,
        netTaxableAmount,
        totalAmount,
      },
      smartExpiryInfo: {
        guarantee: true,
        message: 'All items are backed by PantryPal Freshness & Automated Expiry Tracking System.',
      },
    };
  }
}

export const mockStorage = new MockStorageService();
