import express from 'express';
import UserController from '../Controllers/userCn.js';
import { isLogin } from '../Middleware/islogin.js';

const UserRouter = express.Router();


UserRouter.post('/', UserController.createUser);


UserRouter.get('/:id', UserController.getUser);

export default UserRouter;