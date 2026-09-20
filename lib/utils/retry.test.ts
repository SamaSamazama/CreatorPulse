import { describe, it, expect, vi } from 'vitest';
import { withTimeout, withRetry } from '@/lib/utils/retry';

describe('withTimeout', () => {
  it('should resolve with value if promise resolves before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await withTimeout(promise, 1000);
    expect(result).toBe('success');
  });

  it('should reject with timeout error if promise takes too long', async () => {
    const promise = new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 5000));
    await expect(withTimeout(promise, 100)).rejects.toThrow('Request timeout');
  });
});

describe('withRetry', () => {
  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, 3);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    const result = await withRetry(fn, 3);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(withRetry(fn, 2)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
