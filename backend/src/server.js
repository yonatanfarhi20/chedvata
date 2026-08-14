require('dotenv').config();

const app = require('./app');
const connectDb = require('./config/db');
const { getJwtSecret } = require('./config/jwt');
const { startJobs } = require('./jobs');

const port = Number(process.env.PORT) || 5000;

async function start() {
  getJwtSecret();
  await connectDb();
  startJobs();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
