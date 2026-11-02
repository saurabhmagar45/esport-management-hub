import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();

    // Ensure Master Admin exists without purging registered data
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🎮 ESPORT HUB REST API SERVER ACTIVE`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`🎯 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`👑 Single Master Admin: admin@esporthub.gg / password123`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
}

bootstrap();
