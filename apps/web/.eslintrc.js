/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ['@repo/eslint-config/next.js'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
	},
	rules: {
		'@typescript-eslint/explicit-function-return-type': 'off',
	},
};
