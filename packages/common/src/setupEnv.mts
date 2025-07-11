import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import fs from "fs";

export default function setupEnv(projectPath = process.cwd()) {
  const NODE_ENV = process.env.NODE_ENV || "development";
  const dotenv_fp = `${projectPath}/.env.${NODE_ENV}`;
  let env;
  if (fs.existsSync(dotenv_fp)) {
    env = dotenv.config({
      path: dotenv_fp,
    });
  }
  if (fs.existsSync(`${projectPath}/.env.${NODE_ENV}.local`)) {
    env = dotenv.config({ path: `${projectPath}/.env.${NODE_ENV}.local`, override: true });
  }
  if (NODE_ENV !== "test" && fs.existsSync(`${projectPath}/.env`)) {
    env = dotenv.config({ path: `${projectPath}/.env`, override: true });
  }
  if (env) {
    dotenvExpand.expand(env);
  }
}
