import express from 'express';
import UserController from '../Controllers/userCn.js';

const UserRouter = express.Router();


UserRouter.post('/', UserController.createUser);
UserRouter.post('/login', UserController.login);
UserRouter.get('/:id', UserController.getUser);

export default UserRouter;