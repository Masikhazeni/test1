import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import catchError from './utils/catchError.js';
import DeviceRouter from './Routes/device.js'
import DeviceDataRouter from './Routes/deviceData.js'
import SSERouter from './Routes/sseRote.js'

const app = express();


app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


// app.use('/api/users', userRouter);
app.use('/api/devices', DeviceRouter);
app.use('/api/device-data', DeviceDataRouter);
app.use('/api/sse', SSERouter);

// Error handler
app.use(catchError);

export default app;
