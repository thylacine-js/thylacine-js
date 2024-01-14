import { useEffect } from 'react';

const useHMR = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      new EventSource('/esbuild').addEventListener('change', (e) => {
        const { added, removed, updated } = JSON.parse(e.data);
        console.log({added, removed, updated});
        if (!added.length && !removed.length && updated.length === 1) {
          for (const link of document.getElementsByTagName("link")) {
            const url = new URL(link.href);
            if (url.host === location.host && url.pathname === updated[0]) {
              const next = link.cloneNode()
              next.href = updated[0] + '?' + Math.random().toString(36).slice(2)
              next.onload = () => link.remove()
              link.parentNode.insertBefore(next, link.nextSibling)
              return
            }
          }
        }
        location.reload();
      });
    }
  }, []);
};
export default useHMR;