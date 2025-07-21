import express from 'express';
import DeviceDataController from '../Controllers/deviceDataCn.js';
import { isLogin } from '../Middleware/islogin.js';

const DeviceDataRouter = express.Router();


DeviceDataRouter.post('/', DeviceDataController.storeData);
DeviceDataRouter.get('/device/:deviceId', DeviceDataController.getDeviceData);
DeviceDataRouter.get('/user/:userId', DeviceDataController.getUserDeviceData);

export default DeviceDataRouter;