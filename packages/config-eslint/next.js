module.exports = {
	extends: [
		'@vercel/style-guide/eslint/node',
		'@vercel/style-guide/eslint/typescript',
		'@vercel/style-guide/eslint/browser',
		'@vercel/style-guide/eslint/react',
		'@vercel/style-guide/eslint/next',
		'turbo',
	],
	parserOptions: {
		project: require('path').resolve(process.cwd(), 'tsconfig.json'),
	},
	globals: {
		React: true,
		JSX: true,
	},
	plugins: ['only-warn'],
	settings: {
		'import/resolver': {
			typescript: {
				project: require('path').resolve(process.cwd(), 'tsconfig.json'),
			},
		},
	},
	ignorePatterns: ['.*.js', 'node_modules/', 'dist/'],
	rules: {
		'import/no-default-export': 'off',
		'@next/next/no-html-link-for-pages': 'off',
	},
};
