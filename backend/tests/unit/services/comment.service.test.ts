/**
 * M7 comment.service 단위 테스트. vi.mock으로 article.repo·comment.repo 격리.
 * AC-01·03a·03b·03c·05 + plan §3 commit 3 매핑.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/repositories/article.repo.js', () => ({
  findById: vi.fn(),
}));

vi.mock('../../../src/repositories/comment.repo.js', () => ({
  findManyByArticle: vi.fn(),
  findById: vi.fn(),
  insertComment: vi.fn(),
  deleteComment: vi.fn(),
}));

import * as service from '../../../src/services/comment.service.js';
import * as articleRepo from '../../../src/repositories/article.repo.js';
import * as commentRepo from '../../../src/repositories/comment.repo.js';
import { NotFoundError } from '../../../src/errors/not-found-error.js';

const mockArticleRepo = vi.mocked(articleRepo);
const mockCommentRepo = vi.mocked(commentRepo);

beforeEach(() => {
  vi.clearAllMocks();
});

const fakeArticle = {
  id: 1,
  title: 't',
  body: 'b',
  author: 'a',
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [] as string[],
};

const fakeComment = {
  id: 5,
  articleId: 1,
  body: '재밌네요',
  author: 'min',
  createdAt: new Date(),
};

describe('list', () => {
  it('article 존재 → findManyByArticle 호출 + 댓글 반환', async () => {
    mockArticleRepo.findById.mockResolvedValue(fakeArticle);
    mockCommentRepo.findManyByArticle.mockResolvedValue([fakeComment]);

    const result = await service.list(1);

    expect(mockArticleRepo.findById).toHaveBeenCalledWith(1);
    expect(mockCommentRepo.findManyByArticle).toHaveBeenCalledWith(1);
    expect(result).toEqual({ comments: [fakeComment] });
  });

  it('article 미존재 → NotFoundError("글을 찾을 수 없습니다") throw', async () => {
    mockArticleRepo.findById.mockResolvedValue(null);

    await expect(service.list(999)).rejects.toThrow(NotFoundError);
    await expect(service.list(999)).rejects.toThrow('글을 찾을 수 없습니다');
    expect(mockCommentRepo.findManyByArticle).not.toHaveBeenCalled();
  });
});

describe('create', () => {
  it('article 존재 → insertComment → findById 반환', async () => {
    mockArticleRepo.findById.mockResolvedValue(fakeArticle);
    mockCommentRepo.insertComment.mockResolvedValue(11);
    mockCommentRepo.findById.mockResolvedValue({ ...fakeComment, id: 11 });

    const result = await service.create(1, { body: '재밌네요', author: 'min' });

    expect(mockCommentRepo.insertComment).toHaveBeenCalledWith({
      articleId: 1,
      body: '재밌네요',
      author: 'min',
    });
    expect(result.id).toBe(11);
  });

  it('article 미존재 → NotFoundError throw, insertComment 미호출', async () => {
    mockArticleRepo.findById.mockResolvedValue(null);

    await expect(
      service.create(999, { body: 'hi', author: 'a' }),
    ).rejects.toThrow('글을 찾을 수 없습니다');
    expect(mockCommentRepo.insertComment).not.toHaveBeenCalled();
  });

  it('insert 직후 findById null → REPO_INSERT_RACE Error', async () => {
    mockArticleRepo.findById.mockResolvedValue(fakeArticle);
    mockCommentRepo.insertComment.mockResolvedValue(12);
    mockCommentRepo.findById.mockResolvedValue(null);

    await expect(
      service.create(1, { body: 'hi', author: 'a' }),
    ).rejects.toThrow('REPO_INSERT_RACE');
  });
});

describe('remove', () => {
  it('comment 존재 + articleId 일치 → deleteComment 호출', async () => {
    mockCommentRepo.findById.mockResolvedValue(fakeComment);

    await service.remove(1, 5);

    expect(mockCommentRepo.deleteComment).toHaveBeenCalledWith(5);
  });

  it('comment 미존재 → NotFoundError("댓글을 찾을 수 없습니다")', async () => {
    mockCommentRepo.findById.mockResolvedValue(null);

    await expect(service.remove(1, 999)).rejects.toThrow(NotFoundError);
    await expect(service.remove(1, 999)).rejects.toThrow('댓글을 찾을 수 없습니다');
    expect(mockCommentRepo.deleteComment).not.toHaveBeenCalled();
  });

  it('comment 존재하나 articleId mismatch → NotFoundError("댓글을 찾을 수 없습니다")', async () => {
    mockCommentRepo.findById.mockResolvedValue({ ...fakeComment, articleId: 2 });

    await expect(service.remove(1, 5)).rejects.toThrow('댓글을 찾을 수 없습니다');
    expect(mockCommentRepo.deleteComment).not.toHaveBeenCalled();
  });
});
