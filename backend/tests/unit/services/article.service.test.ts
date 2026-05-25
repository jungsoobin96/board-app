/**
 * M7 article.service 단위 테스트. vi.mock으로 repository 격리.
 * AC-05·09 + plan §3 commit 3 매핑.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/repositories/article.repo.js', () => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  insertArticle: vi.fn(),
  updateArticle: vi.fn(),
  deleteArticle: vi.fn(),
  upsertTags: vi.fn(),
  linkArticleTags: vi.fn(),
  unlinkArticleTags: vi.fn(),
}));

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(<T,>(cb: (tx: unknown) => Promise<T>) => cb({})),
  },
}));

import * as service from '../../../src/services/article.service.js';
import * as repo from '../../../src/repositories/article.repo.js';
import { NotFoundError } from '../../../src/errors/not-found-error.js';

const mockRepo = vi.mocked(repo);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('normalizeTags', () => {
  it('trim + lower + 중복 제거 + 빈 토큰 무시', () => {
    expect(service.normalizeTags(['JS', 'ts', 'js', ' ', 'TS', '  Node  '])).toEqual([
      'js',
      'ts',
      'node',
    ]);
  });

  it('빈 입력 → 빈 배열', () => {
    expect(service.normalizeTags([])).toEqual([]);
  });

  it('순서 보존 (첫 등장 우선)', () => {
    expect(service.normalizeTags(['b', 'a', 'B', 'A'])).toEqual(['b', 'a']);
  });
});

describe('list', () => {
  it('repo.findMany 호출 + page/limit 메타 포함', async () => {
    mockRepo.findMany.mockResolvedValue({ rows: [], total: 0 });
    const result = await service.list({ page: 2, limit: 5, tag: null });
    expect(mockRepo.findMany).toHaveBeenCalledWith({ page: 2, limit: 5, tag: null });
    expect(result).toEqual({ articles: [], total: 0, page: 2, limit: 5 });
  });
});

describe('get', () => {
  it('findById 결과 null → NotFoundError("글을 찾을 수 없습니다")', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.get(999)).rejects.toThrow(NotFoundError);
    await expect(service.get(999)).rejects.toThrow('글을 찾을 수 없습니다');
  });

  it('정상 → row 반환', async () => {
    const row = {
      id: 1,
      title: 't',
      body: 'b',
      author: 'a',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['js'],
    };
    mockRepo.findById.mockResolvedValue(row);
    expect(await service.get(1)).toEqual(row);
  });
});

describe('create', () => {
  it('withTransaction 안에서 insertArticle → upsertTags → linkArticleTags 순서 호출', async () => {
    mockRepo.insertArticle.mockResolvedValue(42);
    mockRepo.upsertTags.mockResolvedValue([
      { id: 10, name: 'js' },
      { id: 11, name: 'ts' },
    ]);
    const finalRow = {
      id: 42,
      title: 'hi',
      body: 'world',
      author: 'hana',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['js', 'ts'],
    };
    mockRepo.findById.mockResolvedValue(finalRow);

    const result = await service.create({
      title: 'hi',
      body: 'world',
      author: 'hana',
      tagList: ['JS', 'ts', 'js'],
    });

    expect(mockRepo.insertArticle).toHaveBeenCalledWith(
      { title: 'hi', body: 'world', author: 'hana' },
      expect.anything(),
    );
    expect(mockRepo.upsertTags).toHaveBeenCalledWith(['js', 'ts'], expect.anything());
    expect(mockRepo.linkArticleTags).toHaveBeenCalledWith(42, [10, 11], expect.anything());
    expect(result).toEqual(finalRow);
  });

  it('빈 tagList → upsertTags / linkArticleTags 미호출', async () => {
    mockRepo.insertArticle.mockResolvedValue(43);
    mockRepo.findById.mockResolvedValue({
      id: 43,
      title: 't',
      body: 'b',
      author: 'a',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    });

    await service.create({ title: 't', body: 'b', author: 'a', tagList: [] });

    expect(mockRepo.insertArticle).toHaveBeenCalledOnce();
    expect(mockRepo.upsertTags).not.toHaveBeenCalled();
    expect(mockRepo.linkArticleTags).not.toHaveBeenCalled();
  });
});

describe('update', () => {
  it('미존재 id → NotFoundError', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      service.update(999, { title: 't', body: 'b', author: 'a', tagList: [] }),
    ).rejects.toThrow(NotFoundError);
  });

  it('정상 → unlinkArticleTags 후 upsertTags + linkArticleTags 호출 (전체 교체)', async () => {
    const existing = {
      id: 1,
      title: 'old',
      body: 'old',
      author: 'a',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['a', 'b'],
    };
    const updated = { ...existing, title: 'new', tags: ['c'] };
    mockRepo.findById.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);
    mockRepo.upsertTags.mockResolvedValue([{ id: 20, name: 'c' }]);

    await service.update(1, { title: 'new', body: 'old', author: 'a', tagList: ['C'] });

    expect(mockRepo.unlinkArticleTags).toHaveBeenCalledWith(1, expect.anything());
    expect(mockRepo.upsertTags).toHaveBeenCalledWith(['c'], expect.anything());
    expect(mockRepo.linkArticleTags).toHaveBeenCalledWith(1, [20], expect.anything());
  });
});

describe('remove', () => {
  it('미존재 id → NotFoundError', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.remove(999)).rejects.toThrow(NotFoundError);
  });

  it('정상 → deleteArticle 호출', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 1,
      title: 't',
      body: 'b',
      author: 'a',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    });
    await service.remove(1);
    expect(mockRepo.deleteArticle).toHaveBeenCalledWith(1);
  });
});
