import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type ApiHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => Promise<void>;

/** Node ServerResponse shim for Vercel's res.status().json() API. */
function toVercelResponse(res: ServerResponse): VercelResponse {
  const vercelRes = res as VercelResponse;

  vercelRes.status = (code: number) => {
    res.statusCode = code;
    return vercelRes;
  };

  vercelRes.json = (body: unknown) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(body));
    }
    return vercelRes;
  };

  vercelRes.send = (body: unknown) => {
    if (!res.headersSent) {
      if (typeof body === 'string') {
        res.end(body);
      } else {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(body));
      }
    }
    return vercelRes;
  };

  return vercelRes;
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function runHandler(
  handler: ApiHandler,
  req: IncomingMessage,
  res: ServerResponse,
  body: string,
): void {
  const vercelReq = req as VercelRequest;
  vercelReq.body = body ? JSON.parse(body) : {};
  const vercelRes = toVercelResponse(res);

  void handler(vercelReq, vercelRes).catch((err) => {
    console.error('[local-api]', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Generation failed' }));
    }
  });
}

function mountRoute(
  server: ViteDevServer,
  path: string,
  loadHandler: () => Promise<{ default: ApiHandler }>,
): void {
  server.middlewares.use(async (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url !== path || req.method !== 'POST') {
      next();
      return;
    }

    try {
      const body = await readBody(req);
      const mod = await loadHandler();
      runHandler(mod.default, req, res, body);
    } catch (err) {
      console.error('[local-api]', path, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Local API error' }));
    }
  });
}

/** Run Vercel API routes during `npm run dev` (Vite-only). */
export function viteLocalApi(): Plugin {
  return {
    name: 'mealprep-local-api',
    configureServer(server) {
      mountRoute(server, '/api/generate-plan', () =>
        import('../api/generate-plan'),
      );
      mountRoute(server, '/api/generate-meal', () =>
        import('../api/generate-meal'),
      );
    },
  };
}
