import express from 'express';
import DeviceController from '../Controllers/deviceCn.js';
import { isLogin } from '../Middleware/islogin.js';
import { param } from 'express-validator';
import checkValidation from '../Middleware/checkValidation.js';

const DeviceRouter = express.Router();
const userIdValidation = [
  param('userId')
    .notEmpty()
    .withMessage('شناسه کاربر الزامی است'),
];

DeviceRouter.get('/user/:userId', isLogin,userIdValidation,checkValidation,DeviceController.getUserDevices);


export default DeviceRouter;