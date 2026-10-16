import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/database.js';

async function start() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    app.listen(env.PORT, () => {
      console.log(`\n🚀 BookEase API Server running`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   API:         ${env.BACKEND_URL}/api`);
      console.log(`   Health:      ${env.BACKEND_URL}/api/health`);
      console.log(`   Frontend:    ${env.FRONTEND_URL}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
