import _ from "lodash";
import { globbySync } from "globby";

export default async function findLayoutFiles({ appDir = process.cwd() } = {}) {
  const r = [];
  const path_matchers = [`${appDir}/layouts/**.jsx`];
  const paths = globbySync(path_matchers);
  for (const path of paths) {
    const m = path.match(`./layouts/(.*)\.jsx`);
    if (m) {
      r.push({
        class_name: m[1],
        file_path: `${m[1]}.jsx`,
      });
    }
  }
  return r;
}
