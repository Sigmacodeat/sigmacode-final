/* eslint-disable @typescript-eslint/no-var-requires */
const { rest } = require('msw');

exports.handlers = [
  // AutoOptimizer endpoints
  rest.get('/api/bundle-info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ size: 123456, generatedAt: new Date().toISOString() }));
  }),

  rest.get('/api/cache-stats', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ hitRate: 0.87, generatedAt: new Date().toISOString() }));
  }),
];
