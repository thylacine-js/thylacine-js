export default function esbuildOnEndBuild({ name, handler }) {
  return {
    name,
    setup(build) {
      build.onStart(async () => {
        if (handler) {
          await handler(build);
        }
      });
    },
  };
}
