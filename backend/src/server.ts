/**
 * Backend 부팅 entrypoint.
 * R-N-04 정합: validateEnv() 실패 시 process.exit(1) + stderr 한국어 메시지.
 * 정상 부팅 시 stdout `Listening on http://localhost:${PORT}` 1줄.
 */
import { validateEnv } from './env.js';
import { buildApp } from './app.js';

function main(): void {
  let env;
  try {
    env = validateEnv();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }

  const app = buildApp(env);
  app.listen(env.PORT, () => {
    console.log(`Listening on http://localhost:${env.PORT}`);
  });
}

main();
