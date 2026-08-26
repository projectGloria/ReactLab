import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Vite plugin to read local playground files
const playgroundPlugin = () => ({
  name: 'playground-loader',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/api/playground/')) {
        const lessonId = req.url.replace('/api/playground/', '').split('?')[0];
        const dirPath = path.join(import.meta.dirname, 'src/playground', lessonId);
        
        try {
          const files = {};
          if (fs.existsSync(dirPath)) {
            const fileNames = fs.readdirSync(dirPath);
            for (const file of fileNames) {
              const fullPath = path.join(dirPath, file);
              if (fs.statSync(fullPath).isFile()) {
                files[`/${file}`] = fs.readFileSync(fullPath, 'utf-8');
              }
            }
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ files }));
        } catch (e) {
          res.statusCode = 500;
          res.end(e.toString());
        }
        return;
      }
      
      next();
    });
  },
  handleHotUpdate({ file, server }) {
    if (file.replace(/\\/g, '/').includes('/src/playground/')) {
      server.ws.send({ type: 'custom', event: 'playground-update' });
      return [];
    }
  }
});

export default defineConfig({
  base: './', // Important for Electron file:// relative asset loading
  plugins: [react(), playgroundPlugin()],
  server: {
    port: 5180,
    strictPort: true, // Fail early instead of silently jumping ports
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@codesandbox/sandpack-react') || id.includes('@codesandbox/sandpack-client')) {
            return 'vendor-sandpack';
          }
          if (id.includes('framer-motion')) {
            return 'vendor-framer';
          }
          if (id.includes('react-markdown') || id.includes('vfile') || id.includes('unist') || id.includes('remark') || id.includes('unified')) {
            return 'vendor-markdown';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('prettier')) {
            return 'vendor-prettier';
          }
        }
      }
    }
  }
})
