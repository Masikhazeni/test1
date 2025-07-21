import express from 'express';
import DeviceController from '../Controllers/deviceCn.js';

const DeviceRouter = express.Router();
DeviceRouter.post('/', DeviceController.createDevice);
DeviceRouter.get('/user/:userId', DeviceController.getUserDevices);
DeviceRouter.delete('/:id', DeviceController.deleteDevice);

export default DeviceRouter;