require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initExpiryCronJob } = require('./jobs/expiryCronJob');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Product = require('./models/Product');
const { seedDatabase } = require('./utils/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const addressRoutes = require('./routes/addressRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const expiryRoutes = require('./routes/expiryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Production-ready CORS with environment whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/expiry', expiryRoutes);
app.use('/api/admin', adminRoutes);

// Base Health Route (Used by AWS Application Load Balancer Target Group)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PantryPal Backend API',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    expiryEngine: 'Active',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Controlled database seeding: Only run if empty AND (development mode OR explicitly allowed)
  const isDev = process.env.NODE_ENV !== 'production';
  const allowSeed = process.env.ALLOW_SEED === 'true';
  const count = await Product.countDocuments();
  if (count === 0 && (isDev || allowSeed)) {
    console.log('[System] Empty database detected. Auto-running database seeder...');
    await seedDatabase();
  }

  // Initialize Background Expiry Monitoring Job (Can be disabled if using AWS EventBridge)
  if (process.env.ENABLE_INTERNAL_CRON !== 'false') {
    initExpiryCronJob();
  } else {
    console.log('[Cron Job] Internal node-cron disabled (Delegated to external scheduler like AWS EventBridge)');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 PantryPal Backend Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
