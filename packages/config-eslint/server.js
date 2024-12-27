module.exports = {
	extends: ['@vercel/style-guide/eslint/node', '@vercel/style-guide/eslint/typescript'].map(require.resolve),
	parserOptions: {
		project: require('path').resolve(process.cwd(), 'tsconfig.json'),
	},
	env: {
		node: true,
		es6: true,
	},
	plugins: ['only-warn'],
	settings: {
		'import/resolver': {
			typescript: {
				project: require('path').resolve(process.cwd(), 'tsconfig.json'),
			},
		},
	},
	overrides: [
		{
			files: ['**/__tests__/**/*'],
			env: {
				jest: true,
			},
		},
	],
	ignorePatterns: ['.*.js', 'node_modules/', 'dist/'],
	rules: {
		'import/no-default-export': 'off',
	},
};
