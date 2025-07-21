import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

// POST /api/users - ایجاد کاربر جدید
router.post('/', UserController.createUser);

// GET /api/users/:id - دریافت اطلاعات کاربر
router.get('/:id', UserController.getUser);

export default router;