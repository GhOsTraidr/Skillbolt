import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UnifiedService } from './service.js';
import type { ServerOptions } from './types.js';
import { broadcast, createWebSocketHandler } from './websocket.js';

const PUBLIC_DIR = join(fileURLToPath(new URL('..', import.meta.url)), 'public');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
};

const DEMOS = [
  {
    id: 'frontend_debug',
    title: 'Frontend Debug Report',
    description: 'Fix login page bug and generate report.',
    prompt: 'I am a front-end developer. Users have reported a bug on the mobile login page...',
    files: ['artifacts/login.html'],
    icon: 'bug',
  },
  {
    id: 'ui_research',
    title: 'Fusion UI Design',
    description: 'Visual design research for knowledge management product.',
    prompt: 'I am a product designer, our company is planning a knowledge management product...',
    files: [],
    icon: 'design',
  },
  {
    id: 'paper_promotion',
    title: 'Paper Promotion Assistant',
    description: 'Multi-platform promotion plan for research paper.',
    prompt: 'As a PhD student, I recently completed a research paper...',
    files: ['artifacts/Avengers.pdf'],
    icon: 'paper',
  },
];

const sendJson = (res: ServerResponse, status: number, body: object): void => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const readBody = async (req: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
};

const resolveStaticPath = (pathname: string): string => {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const cleaned = safePath.startsWith('/') ? safePath.slice(1) : safePath;
  return join(PUBLIC_DIR, cleaned);
};

const serveStatic = (req: IncomingMessage, res: ServerResponse): void => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const filePath = resolveStaticPath(url.pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' });
  res.end(readFileSync(filePath));
};

export const createApp = (options: ServerOptions = {}) => {
  const service = new UnifiedService(options);
  const wsServer = createWebSocketHandler({
    onMessage: (ws, message) => {
      const data = message.data ?? {};
      switch (message.type) {
        case 'start_search': {
          const task = typeof data.task === 'string' ? data.task : '';
          const taskName = typeof data.task_name === 'string' ? data.task_name : '';
          const files = Array.isArray(data.files) ? (data.files as string[]) : [];
          void service.startSearch(task, taskName, files);
          break;
        }
        case 'confirm_search':
          service.confirmSearch();
          break;
        case 'confirm_skills': {
          const mode = data.execution_mode === 'freestyle' ? 'freestyle' : 'dag';
          void service.confirmSkills(mode);
          break;
        }
        case 'update_skills': {
          const skillIds = Array.isArray(data.skill_ids) ? (data.skill_ids as string[]) : [];
          service.updateSkillSelection(skillIds);
          break;
        }
        case 'select_plan': {
          const index = typeof data.index === 'number' ? data.index : 0;
          service.selectPlan(index);
          break;
        }
        case 'reset':
          service.reset();
          break;
        case 'sync':
          ws.send(JSON.stringify({ type: 'init', data: { ...service.getState() } }));
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', data: { message: 'Unknown message type' } }));
      }
    },
  });

  service.setBroadcaster((type, data) => broadcast(wsServer, type, data));

  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/') {
      serveStatic(req, res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/tree') {
      sendJson(res, 200, { tree: service.getState().treeData ?? null });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/skill-groups') {
      sendJson(res, 200, { groups: service.getSkillGroups() });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/demos') {
      sendJson(res, 200, {
        demos: DEMOS.map((demo) => ({
          ...demo,
          file_count: demo.files.length,
        })),
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/upload') {
      await readBody(req);
      sendJson(res, 501, { error: 'Upload not implemented' });
      return;
    }

    serveStatic(req, res);
  });

  httpServer.on('upgrade', (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
      wsServer.emit('connection', ws, req);
      ws.send(JSON.stringify({ type: 'init', data: { ...service.getState() } }));
      service.ensureAutoStart();
    });
  });

  return { httpServer, wsServer, service };
};

export const startServer = async (options: ServerOptions = {}) => {
  const port = options.port ?? 8765;
  const { httpServer, wsServer, service } = createApp(options);
  await new Promise<void>((resolve) => {
    httpServer.listen(port, () => resolve());
  });
  return { httpServer, wsServer, service };
};
