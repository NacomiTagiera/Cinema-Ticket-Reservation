import { body } from 'express-validator';

export const registerValidation = [
	body('username')
		.isString()
		.isLength({ min: 3 })
		.withMessage('Username must be at least 3 characters long'),
	body('email').isEmail().withMessage('Invalid email format'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const loginValidation = [
	body('username').isString().notEmpty().withMessage('Username is required'),
	body('password').notEmpty().withMessage('Password is required'),
];
