/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	extends: ['@repo/eslint-config/server.js'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
	},
	rules: {
		'no-console': 'off',
		'@typescript-eslint/no-extraneous-class': 'off',
	},
};
