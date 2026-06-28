import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/weather2/', // 👈 GitHub Pages 저장소(repository) 경로를 추가했습니다.
  plugins: [
    react(),
    {
      name: 'override-mime-type',
      enforce: 'pre',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const originalSetHeader = res.setHeader;
          res.setHeader = function(name: string, value: any) {
            if (name.toLowerCase() === 'content-type' && req.url && (req.url.includes('.ts') || req.url.includes('.tsx'))) {
              value = 'application/javascript';
            }
            return originalSetHeader.call(this, name, value);
          };
          next();
        });
      }
    }
  ],
})
