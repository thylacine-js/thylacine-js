import fs from "fs";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

export default function setupEnv(projectPath = process.cwd()) {
  const dotenv_fp = `${projectPath}/.env.${
    process.env.NODE_ENV || "development"
  }`;
  let env;
  if (fs.existsSync(dotenv_fp)) {
    env = dotenv.config({
      path: dotenv_fp,
    });
  }
  if (fs.existsSync(`${projectPath}/.env`)) {
    env = dotenv.config({ path: `${projectPath}/.env`, override: true });
  }
  if (env) {
    dotenvExpand.expand(env);
  }
}
