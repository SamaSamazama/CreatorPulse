import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockFindFirst, mockUpdate, mockSet, mockWhere, mockRedisGet, mockRedisSet } = vi.hoisted(() => {
  const mockFindFirst = vi.fn();
  const mockUpdate = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn();
  const mockRedisGet = vi.fn();
  const mockRedisSet = vi.fn();
  return { mockFindFirst, mockUpdate, mockSet, mockWhere, mockRedisGet, mockRedisSet };
});

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      apiKeys: {
        findFirst: mockFindFirst,
      },
    },
    update: mockUpdate,
  },
}));

vi.mock('@/lib/db/schema', () => ({
  apiKeys: { id: 'id', userId: 'userId', apiKey: 'apiKey' },
  eq: vi.fn(() => ({})),
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    get: mockRedisGet,
    set: mockRedisSet,
  })),
}));

import { validatePublicApiKey, corsResponse, corsOptions } from '@/lib/api-auth';
import { NextRequest } from 'next/server';

describe('validatePublicApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENABLE_PUBLIC_API = 'true';
    process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue(undefined);
    mockRedisGet.mockResolvedValue(null);
    mockRedisSet.mockResolvedValue(undefined);
  });

  it('should return error when public API is disabled', async () => {
    process.env.ENABLE_PUBLIC_API = 'false';
    const req = new NextRequest('http://localhost/api', {
      headers: { 'x-api-key': 'key' },
    });
    const result = await validatePublicApiKey(req);
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(503);
    expect(result.userId).toBeNull();
  });

  it('should return error when API key is missing', async () => {
    const req = new NextRequest('http://localhost/api');
    const result = await validatePublicApiKey(req);
    expect(result.error!.status).toBe(401);
    expect(result.userId).toBeNull();
  });

  it('should return error when API key is invalid', async () => {
    mockFindFirst.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api', {
      headers: { 'x-api-key': 'bad-key' },
    });
    const result = await validatePublicApiKey(req);
    expect(result.error!.status).toBe(401);
    expect(result.userId).toBeNull();
  });

  it('should return userId when API key is valid', async () => {
    mockFindFirst.mockResolvedValue({ id: 1, userId: 'user-1', apiKey: 'valid-key' });
    const req = new NextRequest('http://localhost/api', {
      headers: { 'x-api-key': 'valid-key' },
    });
    const result = await validatePublicApiKey(req);
    expect(result.error).toBeNull();
    expect(result.userId).toBe('user-1');
    expect(mockUpdate).toHaveBeenCalled();
  });
});

describe('corsResponse', () => {
  it('should include CORS headers for allowed origin', () => {
    const response = corsResponse({ ok: true }, 200, 'https://my-creator-pulse-4yqru39wb-samasamazamas-projects.vercel.app');
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('https://my-creator-pulse-4yqru39wb-samasamazamas-projects.vercel.app');
  });
});

describe('corsOptions', () => {
  it('should return 204 with CORS headers', () => {
    const response = corsOptions('http://localhost:3000');
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
  });
});
