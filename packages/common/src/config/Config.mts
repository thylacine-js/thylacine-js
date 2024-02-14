import fs from "fs";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

export class Config {
  public static init(projectPath: string = process.cwd()): void {
    const dotenv_fp = `${projectPath}/.env.${process.env.NODE_ENV || "development"}`;
    let env: dotenv.DotenvConfigOutput;
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
}
