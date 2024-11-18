import express, { type Request, type Response } from 'express';
import { validationResult } from 'express-validator';

import { userRepository } from '../repositories/index.js';
import { comparePassword, generateToken, hashPassword } from '../utils/auth.js';
import { loginValidation, registerValidation } from '../utils/validators/authValidators.js';

const router: express.Router = express.Router();

router.post('/register', registerValidation, async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ error: errors.array()[0]?.msg });
		return;
	}

	const { username, email, password } = req.body;

	const existingUser = await userRepository.findByUsernameOrEmail(username, email);

	if (existingUser) {
		if (existingUser.email === email) {
			res.status(400).json({ error: 'Email is already in use' });
		} else {
			res.status(400).json({ error: 'Username is already taken' });
		}
		return;
	}

	const hashedPassword = await hashPassword(password);
	const user = await userRepository.createUser({
		username,
		email,
		password: hashedPassword,
	});

	const token = generateToken(user.id, user.role);
	res.status(201).json({ message: 'User registered successfully', token });
});

router.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}

	const { username, password } = req.body;

	const user = await userRepository.findByUsername(username);
	if (!user) {
		res.status(400).json({ error: 'User does not exist' });
		return;
	}

	const isPasswordValid = await comparePassword(password, user.password);
	if (!isPasswordValid) {
		res.status(400).json({ error: 'Invalid username or password' });
		return;
	}

	const token = generateToken(user.id, user.role);
	res.status(200).json({ message: 'Login successful', token });
});

export default router;
