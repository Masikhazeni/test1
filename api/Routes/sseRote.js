import express from 'express';
import SSEController from '../Controllers/sseCn.js';

const SSERouter = express.Router();
SSERouter.get('/:userId', SSEController.streamUserData);

export default SSERouter;