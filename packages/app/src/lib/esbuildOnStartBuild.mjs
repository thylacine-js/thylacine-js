export default function esbuildOnStartBuild ({name, handler}) {
  return {
    name,
    setup(build) {
      build.onStart(async () => {
        if (handler) {
          await handler(build);
        }
      })
    },
  }
}
