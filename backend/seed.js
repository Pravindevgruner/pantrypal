require('dotenv').config();
const connectDB = require('./src/config/db');
const { seedDatabase } = require('./src/utils/seedData');

const run = async () => {
  await connectDB();
  const credentials = await seedDatabase();
  console.log('\n==================================================');
  console.log(' PANTRYPAL SEED DATA INITIALIZED SUCCESSFULLY');
  console.log('==================================================');
  console.log(` Admin Login:         ${credentials.adminEmail} / ${credentials.password}`);
  console.log(` Customer Login:      ${credentials.customerEmail} / ${credentials.password}`);
  console.log(` Delivery Login:      ${credentials.deliveryEmail} / ${credentials.password}`);
  console.log('==================================================\n');
  process.exit(0);
};

run();
