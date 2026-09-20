import { describe, it, expect, vi } from 'vitest';
import { logger } from '@/lib/monitoring/logger';

describe('logger', () => {
  it('should log error messages', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('Test error', new Error('test'));
    expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error', expect.any(Object));
    consoleSpy.mockRestore();
  });

  it('should log warn messages', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('Test warning', { data: 'value' });
    expect(consoleSpy).toHaveBeenCalledWith('[WARN] Test warning', { data: 'value' });
    consoleSpy.mockRestore();
  });

  it('should respect log level', () => {
    const originalLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
    process.env.NEXT_PUBLIC_LOG_LEVEL = 'error';
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('Test info');
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
    process.env.NEXT_PUBLIC_LOG_LEVEL = originalLevel;
  });
});
