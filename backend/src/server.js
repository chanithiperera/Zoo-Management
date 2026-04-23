require('dotenv').config();
const validateEnv = require('./config/validateEnv');
const app = require('./app');
const connectDB = require('./config/db');
const { seedAdminUser } = require('./scripts/seedAdmin');
const { seedTicketCatalog } = require('./scripts/seedTicketCatalog');

validateEnv();

const PORT = process.env.PORT || 5000;

const HOST = process.env.HOST || '0.0.0.0';

function listenFromPort(startPort) {
  return new Promise((resolve, reject) => {
    const server = app.listen(startPort, HOST, () => resolve({ server, port: startPort }));
    server.once('error', reject);
  });
}

connectDB().then(async () => {
  await seedAdminUser();
  await seedTicketCatalog();
  const preferred = Number(PORT) || 5000;
  const maxTries = process.env.NODE_ENV === 'production' ? 1 : 20;
  let lastErr;
  for (let i = 0; i < maxTries; i += 1) {
    const p = preferred + i;
    try {
      await listenFromPort(p);
      console.log(`Server listening on http://${HOST}:${p}`);
      if (i > 0) {
        console.log(
          `[server] Port ${preferred} was in use; using ${p}. Set PORT=${p} in backend/.env and point the app at this port.`
        );
      }
      return;
    } catch (err) {
      lastErr = err;
      if (err.code !== 'EADDRINUSE') {
        console.error(err);
        process.exit(1);
      }
    }
  }
  console.error(
    `[server] Could not bind starting at ${preferred} (${maxTries} tries). ${lastErr?.message || ''}\n` +
      'Close other API terminals or set PORT to a free port in backend/.env.'
  );
  process.exit(1);
});
