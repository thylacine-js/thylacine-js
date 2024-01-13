import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

export default function setupEnv(projectPath = process.cwd()) {
  const dotenv_fp = `${projectPath}/.env.${process.env.NODE_ENV || "development"}`;
  dotenv.config({
    path: dotenv_fp,
  });
  dotenv.config({ path: `${projectPath}/.env`, override: true });
}