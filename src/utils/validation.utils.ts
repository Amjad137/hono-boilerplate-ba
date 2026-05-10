import { HonoEnv } from '@/types/hono.type';
import { Hook } from '@hono/zod-validator';
import { Context, TypedResponse } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export const commonValidationHook: Hook<unknown, HonoEnv, string> = (
  result:
    | {
        success: true;
      }
    | {
        success: false;
        error: z.ZodError<unknown>;
      },
  c: Context
): void | Response | TypedResponse<{}> | Promise<void | Response | TypedResponse<{}>> => {
  if (!result.success) {
    c.status(StatusCodes.BAD_REQUEST);
    return c.json(
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        issue: issue.message
      }))
    );
  }
};
