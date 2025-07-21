import express from 'express';
import SSEController from '../Controllers/sseCn.js';
import { isLogin } from '../Middleware/islogin.js';

const SSERouter = express.Router();
SSERouter.get('/:userId',isLogin, SSEController.streamUserData);

export default SSERouter;