import { HonoEnv } from '@/types/hono.type';
import { Hono } from 'hono';
import authHandler from './auth.handler';

import userHandler from './user.handler';
import s3Handler from './s3.handler';

const routesV1 = new Hono<HonoEnv>().basePath('/v1');

routesV1.route('/auth', authHandler);
routesV1.route('/user', userHandler);
routesV1.route('/s3', s3Handler);

export default routesV1;
