export class AuthStore {
	private static instance: AuthStore;
	private _token: string | null = null;

	private constructor() {}

	static getInstance(): AuthStore {
		if (!AuthStore.instance) {
			AuthStore.instance = new AuthStore();
		}

		return AuthStore.instance;
	}

	get isAuthenticated(): boolean {
		return !!this._token;
	}

	get token(): string | null {
		return this._token;
	}

	setToken(token: string): void {
		this._token = token;
	}

	clearToken(): void {
		this._token = null;
	}
}
