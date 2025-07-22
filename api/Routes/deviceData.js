import express from 'express';
import DeviceDataController from '../Controllers/deviceDataCn.js';
import { isLogin } from '../Middleware/islogin.js';
import { body, param} from 'express-validator';
import checkValidation from '../Middleware/checkValidation.js';

const DeviceDataRouter = express.Router();
const storeDataValidation = [
  body('device')
    .notEmpty()
    .withMessage('شناسه دستگاه الزامی است'),
  body('payload.temperature')
    .isNumeric()
    .withMessage('دما باید یک عدد باشد'),
  body('payload.humidity')
    .isNumeric()
    .withMessage('رطوبت باید یک عدد باشد'),
  body('payload.date')
    .notEmpty()
    .withMessage('تاریخ نباید خالی باشد')
];

const deviceIdValidation = [
  param('deviceId')
    .notEmpty()
    .withMessage('شناسه دستگاه الزامی است'),
];

const userIdValidation = [
  param('userId')
    .notEmpty()
    .withMessage('شناسه کاربر الزامی است'),
];


DeviceDataRouter.post('/', storeDataValidation,checkValidation,DeviceDataController.storeData);
DeviceDataRouter.get('/device/:deviceId',deviceIdValidation,checkValidation, DeviceDataController.getDeviceData);
DeviceDataRouter.get('/user/:userId',userIdValidation,checkValidation,DeviceDataController.getUserDeviceData);

export default DeviceDataRouter;