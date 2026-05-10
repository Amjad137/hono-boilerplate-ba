import { createMiddleware } from 'hono/factory';
import { getReasonPhrase } from 'http-status-codes';

export const successResponseHandler = createMiddleware(async (c, next) => {
  await next();
  if (c.res.headers.get('Content-Type')?.toString().includes('application/json')) {
    const bodyText = await c.res.json();
    const isError = c.res.status < 200 || c.res.status >= 400;
    const modifiedBody = {
      error: isError,
      message: getReasonPhrase(c.res.status),
      data: bodyText
    };

    c.res = new Response(JSON.stringify(modifiedBody), {
      status: c.res.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
