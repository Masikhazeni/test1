import dotenv from 'dotenv';
import { startPolling } from './poller.js';
import app from './app.js';
import { connectMongo } from './mongo.js';

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 3000;
connectMongo();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startPolling();
});