import { auth } from '@/config/better-auth';
import { HonoEnv } from '@/types/hono.type';

import { Hono } from 'hono';

const authHandler = new Hono<HonoEnv>().all('/*', (c) => auth.handler(c.req.raw));

export default authHandler;
