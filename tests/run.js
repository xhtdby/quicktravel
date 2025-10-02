// tests/run.js
import { runEngineSuite } from './engine.spec.js';

async function main() {
  try {
    await runEngineSuite(console.log);
    console.log('All tests passed');
  } catch (error) {
    console.error(error instanceof Error ? error.stack : error);
    process.exit(1);
  }
}

main();
