import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sync-auction-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url.endsWith('/api/sync-auction')) {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const { records, players } = JSON.parse(body);
                const data = Object.entries(records).map(([id, record]) => {
                  const p = players.find(p => p.id.toString() === id);
                  return {
                    "Player Name": p?.name || 'Unknown',
                    "Team": record.team,
                    "Sold Price": record.finalPrice,
                    "Rating": p?.rating || 0
                  };
                });

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, "Auction Results");
                
                // Write to the root project folder
                const filePath = path.resolve(server.config.root, '..', 'auction_results.xlsx');
                XLSX.writeFile(wb, filePath);
                
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, path: filePath }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  base: '/ipl-auction-dashboard/',
})
