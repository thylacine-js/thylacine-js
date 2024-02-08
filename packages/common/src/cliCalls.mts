import minimist from "minimist";

export function parseArgs() {
  const args = minimist(process.argv.slice(2));
  return args;
}

export default async function (importMeta, func) {
  if (importMeta.url === `file://${process.argv[1]}`) {
    await func(parseArgs());
  }
}
