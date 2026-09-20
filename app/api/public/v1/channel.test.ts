import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockValidatePublicApiKey, mockCorsResponse, mockCorsOptions } = vi.hoisted(() => {
  const mockValidatePublicApiKey = vi.fn();
  const mockCorsResponse = vi.fn((body: any, status = 200, origin = '') => ({
    json: async () => body,
    status,
    headers: new Map([['access-control-allow-origin', origin || 'http://localhost:3000']]),
  }));
  const mockCorsOptions = vi.fn(() => ({
    status: 204,
    headers: new Map(),
  }));
  return { mockValidatePublicApiKey, mockCorsResponse, mockCorsOptions };
});

vi.mock('@/lib/api-auth', () => ({
  validatePublicApiKey: mockValidatePublicApiKey,
  corsResponse: mockCorsResponse,
  corsOptions: mockCorsOptions,
}));

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      channels: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      videos: {
        findMany: vi.fn(),
      },
    },
    update: vi.fn(),
    insert: vi.fn(() => ({
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  channels: {},
  videos: {},
  eq: vi.fn(() => ({})),
  desc: vi.fn(() => ({})),
}));

import { OPTIONS, GET } from '@/app/api/public/v1/channel/route';
import { NextRequest } from 'next/server';

describe('public channel route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OPTIONS returns 204 with CORS headers', async () => {
    const req = new NextRequest('http://localhost/api/public/v1/channel', { method: 'OPTIONS' });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
  });

  it('GET returns 401 when API key validation fails', async () => {
    mockValidatePublicApiKey.mockResolvedValue({ error: { status: 401 }, userId: null });
    const req = new NextRequest('http://localhost/api/public/v1/channel');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('GET returns channels for valid API key', async () => {
    mockValidatePublicApiKey.mockResolvedValue({ error: null, userId: 'user-1' });
    const req = new NextRequest('http://localhost/api/public/v1/channel');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
