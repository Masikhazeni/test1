import express from 'express';
import UserController from '../Controllers/userCn.js';
import { body,validationResult } from 'express-validator';
import checkValidation from '../Middleware/checkValidation.js';

const UserRouter = express.Router();
const createUserValidation=[
    body('email').isEmail().withMessage('ایمیل معتبر نیست'),
    body('phoneNumber').notEmpty().withMessage('شماره تلفن الزامی است'),
    body('password').matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/)
    .withMessage('رمز عبور باید حداقل ۸ کاراکتر، یک حرف بزرگ، یک حرف کوچک و یک عدد داشته باشد')
]
const loginValidation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('شماره تلفن الزامی است'),
  body('password')
    .notEmpty()
    .withMessage('رمز عبور الزامی است'),
];


UserRouter.post('/',createUserValidation,checkValidation, UserController.createUser);
UserRouter.post('/login',loginValidation,checkValidation, UserController.login);
UserRouter.get('/:id', UserController.getUser);

export default UserRouter;