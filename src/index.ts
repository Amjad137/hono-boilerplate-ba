import app from '@/config/app.config';
import connect from '@/config/db.config';
import environment from '@/config/env.config';
import { serve } from '@hono/node-server';

const startServer = async () => {
  try {
    console.log('🚀 Starting server on port:', process.env.PORT || environment.port);
    await connect();

    // Use PORT from environment (Cloud Run) or fall back to config
    const port = process.env.PORT ? Number(process.env.PORT) : environment.port;

    serve({
      fetch: app.fetch,
      port: port
    });

    console.log(`🌍 [${environment.packageName}:${environment.env}] is running on port ${port}`);
  } catch (error) {
    console.error('unable to start the API', error);
    process.exit(1);
  }
};

startServer();
