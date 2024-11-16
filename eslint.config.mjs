import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['**/dist/**', '**/tmp/**', '**/coverage/**'],
	},
	eslint.configs.recommended,
	eslintConfigPrettier,
	{
		extends: [...tseslint.configs.recommended],

		files: ['**/*.ts', '**/*.mts'],

		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},

		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports',
					disallowTypeAnnotations: false,
				},
			],
			'no-empty-pattern': 'off',
			'@typescript-eslint/no-empty-interface': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{ allowNumber: true, allowBoolean: true },
			],
			'@typescript-eslint/no-misused-promises': [
				'error',
				{
					checksVoidReturn: {
						attributes: false,
					},
				},
			],
			'@typescript-eslint/return-await': ['error', 'in-try-catch'],
		},

		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: 2023,
			sourceType: 'module',

			globals: {
				...globals.node,
			},

			parserOptions: {
				project: './tsconfig.json',
			},
		},
	},
);
