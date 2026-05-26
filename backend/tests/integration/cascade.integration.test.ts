// R-F-07 cascade 무결성 통합 테스트 (08 §M11·§7).
// 실 SQLite dev.db에 접근하므로 단일 thread/fork로 격리 (vitest.integration.config.ts).
// 시나리오: 글 1 + 댓글 3 + 태그 2 + ArticleTag 2 → 글 삭제 → Comment·ArticleTag 0건, Tag 잔존.

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('R-F-07 cascade integration', () => {
  // 매 테스트 전 데이터 정리 (idempotent)
  beforeEach(async () => {
    await prisma.$transaction([
      prisma.articleTag.deleteMany(),
      prisma.comment.deleteMany(),
      prisma.article.deleteMany(),
      prisma.tag.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('글 삭제 시 종속 Comment·ArticleTag가 cascade로 함께 삭제되고 Tag는 잔존', async () => {
    // Given: 글 1 + 댓글 3 + 태그 2 + ArticleTag 2
    const article = await prisma.article.create({
      data: {
        title: 'cascade 검증용 글',
        body: '본 글이 삭제되면 댓글과 ArticleTag도 함께 사라져야 합니다.',
        author: 'tester',
      },
    });
    await prisma.comment.createMany({
      data: [
        { body: '첫번째 댓글', author: 'a', articleId: article.id },
        { body: '두번째 댓글', author: 'b', articleId: article.id },
        { body: '세번째 댓글', author: 'c', articleId: article.id },
      ],
    });
    await prisma.tag.createMany({
      data: [{ name: 'cascade-test-1' }, { name: 'cascade-test-2' }],
    });
    const tags = await prisma.tag.findMany({
      where: { name: { in: ['cascade-test-1', 'cascade-test-2'] } },
    });
    await prisma.articleTag.createMany({
      data: tags.map((t) => ({ articleId: article.id, tagId: t.id })),
    });

    // 사전 검증: 모두 정상 적재
    expect(await prisma.comment.count({ where: { articleId: article.id } })).toBe(3);
    expect(await prisma.articleTag.count({ where: { articleId: article.id } })).toBe(2);
    expect(await prisma.tag.count()).toBe(2);

    // When: 글 삭제
    await prisma.article.delete({ where: { id: article.id } });

    // Then: Comment·ArticleTag는 0건 (cascade), Tag는 잔존
    expect(await prisma.comment.count({ where: { articleId: article.id } })).toBe(0);
    expect(await prisma.articleTag.count({ where: { articleId: article.id } })).toBe(0);
    expect(await prisma.tag.count()).toBe(2);
  });

  it('트랜잭션 throw 주입 시 모든 row가 rollback (Article·Comment·Tag·ArticleTag 0건)', async () => {
    // Given: 빈 DB 상태에서 transaction 안에서 4 테이블 모두 시드 후 throw
    // When/Then: rollback으로 모든 시드가 미반영되어야 함
    await expect(
      prisma.$transaction(async (tx) => {
        const article = await tx.article.create({
          data: { title: 'rollback', body: 'b', author: 'a' },
        });
        await tx.comment.createMany({
          data: [
            { body: 'c1', author: 'a', articleId: article.id },
            { body: 'c2', author: 'b', articleId: article.id },
          ],
        });
        const tag = await tx.tag.create({ data: { name: 'rollback-tag' } });
        await tx.articleTag.create({
          data: { articleId: article.id, tagId: tag.id },
        });
        throw new Error('intentional rollback for cascade test');
      }),
    ).rejects.toThrow('intentional rollback for cascade test');

    // Then: 모든 4 테이블이 0건 (rollback으로 commit 안 됨)
    expect(await prisma.article.count()).toBe(0);
    expect(await prisma.comment.count()).toBe(0);
    expect(await prisma.tag.count()).toBe(0);
    expect(await prisma.articleTag.count()).toBe(0);
  });

  it('태그 삭제 시 종속 ArticleTag만 cascade로 삭제 (Article·Comment 잔존)', async () => {
    // Given: 글 1 + 댓글 1 + 태그 1 + ArticleTag 1
    const article = await prisma.article.create({
      data: { title: '태그 삭제 검증', body: '글은 잔존', author: 'tester' },
    });
    await prisma.comment.create({
      data: { body: '댓글도 잔존', author: 'a', articleId: article.id },
    });
    const tag = await prisma.tag.create({ data: { name: 'orphan-test' } });
    await prisma.articleTag.create({ data: { articleId: article.id, tagId: tag.id } });

    // When: 태그 삭제
    await prisma.tag.delete({ where: { id: tag.id } });

    // Then: ArticleTag는 0건, Article·Comment 잔존
    expect(await prisma.articleTag.count({ where: { tagId: tag.id } })).toBe(0);
    expect(await prisma.article.count({ where: { id: article.id } })).toBe(1);
    expect(await prisma.comment.count({ where: { articleId: article.id } })).toBe(1);
  });
});
