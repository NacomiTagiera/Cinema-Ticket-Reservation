export class AuthStore {
	private static instance: AuthStore;
	private _token: string | null = null;
	private _role: 'ADMIN' | 'USER' | null = null;

	private constructor() {}

	static getInstance(): AuthStore {
		if (!AuthStore.instance) {
			AuthStore.instance = new AuthStore();
		}
		return AuthStore.instance;
	}

	get token(): string | null {
		return this._token;
	}

	get role(): 'ADMIN' | 'USER' | null {
		return this._role;
	}

	get isAuthenticated(): boolean {
		return !!this._token;
	}

	get isAdmin(): boolean {
		return this._role === 'ADMIN';
	}

	setToken(token: string): void {
		this._token = token;
		try {
			const payload = JSON.parse(atob(token.split('.')[1]!));
			this._role = payload.role;
		} catch {
			this._role = null;
		}
	}

	clearToken(): void {
		this._token = null;
		this._role = null;
	}
}
