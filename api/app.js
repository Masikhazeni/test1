import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import catchError from './utils/catchError.js';
import DeviceRouter from './Routes/device.js'
import DeviceDataRouter from './Routes/deviceData.js'
import SSERouter from './Routes/sseRote.js'
import UserRouter from './Routes/user.js';
import jwt from 'jsonwebtoken';


const app = express();


app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


app.use('/api/users', UserRouter);
// app.use((req,res,next)=>{
//   try {
//     const {userId}=jwt.verify(req.headers.authorization.split(' ')[1],process.env.SECRET_JWT)
//     req.userId=userId
//     next()
//   } catch (error) {
//     return res.status(401).json({
//       success:false,
//       message:'اول باید وارد شوید'
//     })
//   }
// })
app.use('/api/devices', DeviceRouter);
app.use('/api/device-data', DeviceDataRouter);
app.use('/api/sse', SSERouter);

// Error handler
app.use(catchError);

export default app;
