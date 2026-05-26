#!/usr/bin/env tsx
/**
 * scripts/smoke.ts — 3 profile (dev/stg/prod) 부팅 smoke 검증
 *
 * 사용: tsx scripts/smoke.ts <profile>
 *   profile: dev | stg | prod
 *
 * 동작:
 *   1. PORT 사전 점유 검사 (EADDRINUSE 회피, F-RISK-05)
 *   2. profile별 backend 부팅 (dev=tsx watch, stg/prod=node dist/server.js)
 *   3. warmup 500ms → 250ms × 20회 polling (GET /api/articles → 200 기대)
 *   4. PASS: ready 시간(ms) 로그 + exit 0
 *      FAIL: child stderr 첫 5줄 + exit 1
 *   5. cleanup: SIGTERM → 1초 후 SIGKILL fallback (F-RISK-03 zombie 방지)
 *
 * 출력 화이트리스트 (F-RISK-07 보안): profile 이름 + PORT + ready 시간 + HTTP status code만.
 *   DATABASE_URL 등 시크릿 절대 출력 금지.
 *
 * env override:
 *   SMOKE_TIMEOUT_MS  (default 5000) — F-RISK-01 완화
 */

import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";

type Profile = "dev" | "stg" | "prod";

const PROFILE_PORTS: Record<Profile, number> = {
  dev: 3000,
  stg: 3001,
  prod: 3002,
};

const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? "5000");
const WARMUP_MS = 500;
const POLL_INTERVAL_MS = 250;
const SIGKILL_GRACE_MS = 1000;

function fail(profile: string, reason: string, stderr?: string[]): never {
  console.error(`[smoke] profile=${profile} — FAIL (${reason})`);
  if (stderr && stderr.length > 0) {
    console.error(`[smoke] last stderr (up to 5 lines):`);
    for (const line of stderr.slice(-5)) {
      console.error(`        ${line}`);
    }
  }
  process.exit(1);
}

async function ensurePortFree(port: number): Promise<void> {
  return new Promise((resolveP, rejectP) => {
    const tester = createServer();
    tester.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        rejectP(new Error(`PORT ${port} already in use — kill existing process and retry`));
      } else {
        rejectP(err);
      }
    });
    tester.once("listening", () => {
      tester.close(() => resolveP());
    });
    tester.listen(port, "127.0.0.1");
  });
}

function spawnBackend(profile: Profile): ChildProcess {
  const isDev = profile === "dev";
  const args = isDev
    ? ["--filter", "@app/backend", "dev"]
    : ["--filter", "@app/backend", `start:${profile}`];

  return spawn("pnpm", args, {
    cwd: resolve(import.meta.dirname, ".."),
    env: process.env,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollReady(port: number, deadline: number): Promise<{ ms: number; status: number } | null> {
  const start = Date.now();
  const url = `http://127.0.0.1:${port}/api/articles`;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(POLL_INTERVAL_MS),
      });
      if (res.status === 200) {
        return { ms: Date.now() - start, status: 200 };
      }
    } catch {
      // backend 미준비 — 다음 polling 대기
    }
    await sleep(POLL_INTERVAL_MS);
  }

  return null;
}

async function killChild(child: ChildProcess): Promise<void> {
  if (!child.pid || child.exitCode !== null) return;

  child.kill("SIGTERM");
  await sleep(SIGKILL_GRACE_MS);

  if (child.exitCode === null) {
    try {
      child.kill("SIGKILL");
    } catch {
      // already dead
    }
  }
}

async function main(): Promise<void> {
  const profile = process.argv[2] as Profile | undefined;
  if (!profile || !["dev", "stg", "prod"].includes(profile)) {
    console.error("[smoke] usage: tsx scripts/smoke.ts <dev|stg|prod>");
    process.exit(2);
  }

  const port = Number(process.env.PORT ?? PROFILE_PORTS[profile]);
  console.log(`[smoke] profile=${profile} port=${port} — spawning backend...`);

  try {
    await ensurePortFree(port);
  } catch (err) {
    fail(profile, (err as Error).message);
  }

  const child = spawnBackend(profile);
  const stderrLines: string[] = [];

  child.stderr?.on("data", (chunk: Buffer) => {
    const lines = chunk.toString("utf8").split(/\r?\n/).filter(Boolean);
    stderrLines.push(...lines);
  });

  const cleanup = async (): Promise<void> => {
    await killChild(child);
  };
  process.on("SIGINT", () => {
    void cleanup().then(() => process.exit(130));
  });

  try {
    await sleep(WARMUP_MS);
    const deadline = Date.now() + TIMEOUT_MS;
    const result = await pollReady(port, deadline);

    if (!result) {
      await cleanup();
      fail(profile, `timeout after ${TIMEOUT_MS}ms`, stderrLines);
    }

    console.log(`[smoke] backend ready in ${result.ms}ms → GET /api/articles → ${result.status} → PASS`);
    await cleanup();
    process.exit(0);
  } catch (err) {
    await cleanup();
    fail(profile, (err as Error).message, stderrLines);
  }
}

void main();
