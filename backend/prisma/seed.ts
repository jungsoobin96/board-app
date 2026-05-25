// dev 데이터베이스 시드 스크립트 (Issue #3, R-N-06 데모 부트스트랩 1줄 정합).
// 글 5건 · 댓글 10건 · 태그 8종 + ArticleTag 다수 삽입.
// idempotent — 매 실행 시 deleteMany 4종 선행 후 createMany.
// 안전 가드: NODE_ENV=dev 외에는 throw.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const env = process.env.NODE_ENV;
  if (env !== 'dev') {
    throw new Error(`[SEED] dev profile에서만 실행 가능합니다 (NODE_ENV=${env ?? 'undefined'})`);
  }

  console.log('[SEED] 기존 데이터 정리 시작 (idempotent)...');
  // 외래키 cascade 의존 순서로 명시 정리 (혹시 모를 PRAGMA 미적용 환경 대비)
  await prisma.$transaction([
    prisma.articleTag.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.article.deleteMany(),
    prisma.tag.deleteMany(),
  ]);
  console.log('[SEED] 정리 완료. 시드 데이터 삽입 시작...');

  // 태그 8종 — name 기준 lowercase 정규화 가정
  const tagNames = ['typescript', 'react', 'node', 'prisma', 'sqlite', 'vitest', 'express', 'pnpm'];
  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name })),
  });
  const tags = await prisma.tag.findMany();
  console.log(`[SEED] 태그 ${tags.length}종 삽입 완료.`);

  // 글 5건
  const articlesSeed = [
    {
      title: 'Conduit Lite 시작하기',
      body: '학습용 풀스택 게시판 프로젝트입니다. 글과 댓글을 cascade로 관리합니다.',
      author: 'hana',
    },
    {
      title: 'Prisma 스키마 작성법',
      body: 'datasource + generator + model 3블록만 알면 됩니다. 관계는 @relation으로.',
      author: 'minsu',
    },
    {
      title: 'React 컴포넌트 분리 가이드',
      body: 'pages → components → primitives. atom/molecule 강제는 과합니다.',
      author: 'jiwoo',
    },
    {
      title: 'pnpm workspaces로 모노레포 빠르게',
      body: 'package.json 4개 + pnpm-workspace.yaml 1개로 충분합니다.',
      author: 'hana',
    },
    {
      title: 'Vitest + Supertest 통합 테스트 패턴',
      body: '실 DB(SQLite)에 작성하고 다음 테스트에서 deleteMany로 정리합니다.',
      author: 'minsu',
    },
  ];
  for (const article of articlesSeed) {
    await prisma.article.create({ data: article });
  }
  const articles = await prisma.article.findMany({ orderBy: { id: 'asc' } });
  console.log(`[SEED] 글 ${articles.length}건 삽입 완료.`);

  // 댓글 10건 — 글마다 1~3건 분산
  const commentsSeed = [
    { body: '잘 봤습니다!', author: 'jiwoo', articleId: articles[0]!.id },
    { body: 'cascade 동작이 인상적이네요.', author: 'minsu', articleId: articles[0]!.id },
    { body: '관계 정의가 깔끔합니다.', author: 'hana', articleId: articles[1]!.id },
    { body: 'M-N 조인은 처음 봤어요.', author: 'jiwoo', articleId: articles[1]!.id },
    { body: '아토믹 디자인 강제 부담이 컸어요.', author: 'minsu', articleId: articles[2]!.id },
    { body: '저는 components/만으로도 충분하네요.', author: 'hana', articleId: articles[2]!.id },
    { body: '워크스페이스 4개로 시작했습니다.', author: 'jiwoo', articleId: articles[3]!.id },
    { body: '의존 그래프가 단순해서 좋네요.', author: 'minsu', articleId: articles[3]!.id },
    { body: '통합 테스트 격리가 핵심이군요.', author: 'hana', articleId: articles[4]!.id },
    { body: 'singleThread 옵션 처음 알았어요.', author: 'jiwoo', articleId: articles[4]!.id },
  ];
  await prisma.comment.createMany({ data: commentsSeed });
  const commentCount = await prisma.comment.count();
  console.log(`[SEED] 댓글 ${commentCount}건 삽입 완료.`);

  // ArticleTag — 글마다 태그 2~3개 연결
  const articleTagData = [
    { articleId: articles[0]!.id, tagId: tags[0]!.id }, // typescript
    { articleId: articles[0]!.id, tagId: tags[7]!.id }, // pnpm
    { articleId: articles[1]!.id, tagId: tags[3]!.id }, // prisma
    { articleId: articles[1]!.id, tagId: tags[4]!.id }, // sqlite
    { articleId: articles[2]!.id, tagId: tags[1]!.id }, // react
    { articleId: articles[2]!.id, tagId: tags[0]!.id }, // typescript
    { articleId: articles[3]!.id, tagId: tags[7]!.id }, // pnpm
    { articleId: articles[3]!.id, tagId: tags[2]!.id }, // node
    { articleId: articles[4]!.id, tagId: tags[5]!.id }, // vitest
    { articleId: articles[4]!.id, tagId: tags[6]!.id }, // express
  ];
  await prisma.articleTag.createMany({ data: articleTagData });
  const articleTagCount = await prisma.articleTag.count();
  console.log(`[SEED] ArticleTag ${articleTagCount}건 삽입 완료.`);

  console.log('[SEED] 시드 적재 완료.');
}

main()
  .catch((err: unknown) => {
    console.error('[SEED] 실패:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
