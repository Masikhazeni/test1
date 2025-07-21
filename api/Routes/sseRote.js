import express from 'express';
import SSEController from '../Controllers/sseCn.js';
import { isLogin } from '../Middleware/islogin.js';
import { param } from 'express-validator';
import checkValidation from '../Middleware/checkValidation.js';

const SSERouter = express.Router();
const userIdValidation = [
  param('userId')
    .notEmpty()
    .withMessage('شناسه کاربر الزامی است'),
];

SSERouter.get('/:userId',isLogin,userIdValidation,checkValidation,SSEController.streamUserData);

export default SSERouter;