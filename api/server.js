import dotenv from 'dotenv';
import { startPolling } from './poller.js';
import app from './app.js';

dotenv.config({ path: './config/config.env' });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startPolling();
});