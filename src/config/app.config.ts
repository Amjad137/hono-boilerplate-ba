import { Hono } from 'hono';

import environment from '@/config/env.config';
import rootApp from '@/handlers';
import routesV1 from '@/handlers/v1';
import { globalErrorHandler } from '@/middlewares/global-error-handler.middleware';
import { successResponseHandler } from '@/middlewares/success-response-handler.middleware';
import { HonoEnv } from '@/types/hono.type';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import { logger } from 'hono/logger';

const app = new Hono<HonoEnv>();

// middlewares
app.use(
  cors({
    // add the allowed origins, methods and headers here
    origin: [environment.clientUrl],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-api-key'
    ],
    credentials: true,
    maxAge: 600
  })
);

app.use(compress());
app.use(logger());

app.use(successResponseHandler);

// routes
app.route('/', routesV1);
app.route('/', rootApp);

app.onError(globalErrorHandler);

if (environment.isDebugMode) {
  showRoutes(app);
}

export default app;
