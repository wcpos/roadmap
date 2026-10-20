// node src/cli.ts [--out <path>]: one sync run. Prints one line of counts; never titles, bodies or plan contents.
import { createClient } from './github.ts';
import { run, summaryLine } from './main.ts';

const USAGE = 'usage: node src/cli.ts [--out <path>]';

async function main(argv: string[]): Promise<number> {
  let out: string | undefined;
  if (argv.length === 2 && argv[0] === '--out' && argv[1]) out = argv[1];
  else if (argv.length !== 0) {
    console.error(USAGE);
    return 2;
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN is required');
    return 2;
  }
  const summary = await run({ client: createClient(token), env: process.env, out });
  console.log(summaryLine(summary));
  return 0;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  console.error(`roadmap-sync: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
