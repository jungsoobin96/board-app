/**
 * M7 tag.service 단위 테스트. vi.mock(tag.repo) 격리.
 * AC-01·02·03 일부 + plan §3 commit 2 매핑.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/repositories/tag.repo.js', () => ({
  findManyByFrequency: vi.fn(),
}));

import * as service from '../../../src/services/tag.service.js';
import * as repo from '../../../src/repositories/tag.repo.js';

const mockRepo = vi.mocked(repo);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('list', () => {
  it('default limit 20 → repo.findManyByFrequency(20) 호출', async () => {
    mockRepo.findManyByFrequency.mockResolvedValue([
      { name: 'js', count: 12 },
      { name: 'ts', count: 7 },
    ]);
    const result = await service.list();
    expect(mockRepo.findManyByFrequency).toHaveBeenCalledWith(20);
    expect(result).toEqual({ tags: [{ name: 'js', count: 12 }, { name: 'ts', count: 7 }] });
  });

  it('빈 결과 → { tags: [] }', async () => {
    mockRepo.findManyByFrequency.mockResolvedValue([]);
    const result = await service.list();
    expect(result).toEqual({ tags: [] });
  });

  it('명시 limit 5 → repo.findManyByFrequency(5) 호출', async () => {
    mockRepo.findManyByFrequency.mockResolvedValue([]);
    await service.list(5);
    expect(mockRepo.findManyByFrequency).toHaveBeenCalledWith(5);
  });
});
