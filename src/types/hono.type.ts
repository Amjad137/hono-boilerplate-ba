import type { Session as BetterAuthSession } from '@/config/better-auth';

export type HonoEnv = {
  Variables: {
    user: BetterAuthSession['user'];
    session: BetterAuthSession['session'];
  };
};
