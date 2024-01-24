import _ from "lodash";
import { globbySync } from "globby";

export default async function findRouteFiles({ appDir = process.cwd() } = {}) {
  const FILE_EXTS = ["js", "jsx", "html"];
  const r = [];
  const path_matchers = FILE_EXTS.map(
    (FILE_EXT) => `${appDir}/routes/**/index.${FILE_EXT}`
  );
  const paths = globbySync(path_matchers);
  for (const path of paths) {
    const m = path.match(`./routes(.*)index\.(.*)`);
    if (m) {
      r.push({
        class_name: `${_.startCase(m[1]).replaceAll(" ", "") || "Root"}Route`,
        route_path: m[1],
        file_path: `${m[1]}index.${m[2]}`,
      });
    }
  }
  return r;
}
