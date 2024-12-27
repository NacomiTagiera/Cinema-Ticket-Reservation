export interface User {
	username: string;
	email: string;
	password: string;
}

export interface UserResponse {
	message: string;
	token: string;
}
