/**
 * Shared Authentication Service
 * Works with both Next.js and Vite apps
 */

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'agent' | 'customer';
  isVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export type AppSource = 'dashboard' | 'public';

export class AuthService {
  private static instance: AuthService;
  private apiUrl: string;
  private appSource: AppSource;

  constructor(apiUrl: string, appSource: AppSource = 'public') {
    this.apiUrl = apiUrl;
    this.appSource = appSource;
  }

  static getInstance(apiUrl: string, appSource: AppSource = 'public'): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(apiUrl, appSource);
    }
    return AuthService.instance;
  }

  /**
   * Login user and establish session
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Source': this.appSource
        },
        credentials: 'include',
        body: JSON.stringify({
          ...credentials,
          appSource: this.appSource
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Login failed'
        };
      }

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-App-Source': this.appSource
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    return null;
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-App-Source': this.appSource
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Register new user (for public app)
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: 'customer' | 'agent';
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Source': this.appSource
        },
        credentials: 'include',
        body: JSON.stringify({
          ...userData,
          appSource: this.appSource
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Registration failed'
        };
      }

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User | null, requiredRole: User['role']): boolean {
    return user?.role === requiredRole;
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: User | null): boolean {
    return this.hasRole(user, 'admin');
  }

  /**
   * Check if user is agent
   */
  isAgent(user: User | null): boolean {
    return this.hasRole(user, 'agent');
  }

  /**
   * Check if user can access dashboard
   */
  canAccessDashboard(user: User | null): boolean {
    return user ? (this.isAdmin(user) || this.isAgent(user)) : false;
  }

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-App-Source': this.appSource
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

/**
 * React hook for Next.js app
 */
export function createAuthHook(apiUrl: string, appSource: AppSource = 'public') {
  const authService = AuthService.getInstance(apiUrl, appSource);

  return function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth check failed');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const login = async (credentials: LoginCredentials) => {
      try {
        setLoading(true);
        const result = await authService.login(credentials);
        
        if (result.success && result.user) {
          setUser(result.user);
          setError(null);
          return result;
        } else {
          setError(result.message || 'Login failed');
          return result;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Login failed';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      } finally {
        setLoading(false);
      }
    };

    const logout = async () => {
      try {
        await authService.logout();
        setUser(null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Logout failed');
      }
    };

    const register = async (userData: Parameters<typeof authService.register>[0]) => {
      try {
        setLoading(true);
        const result = await authService.register(userData);
        
        if (result.success && result.user) {
          setUser(result.user);
          setError(null);
        } else {
          setError(result.message || 'Registration failed');
        }
        
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      } finally {
        setLoading(false);
      }
    };

    return {
      user,
      loading,
      error,
      login,
      logout,
      register,
      checkAuth,
      isAdmin: authService.isAdmin(user),
      isAgent: authService.isAgent(user),
      canAccessDashboard: authService.canAccessDashboard(user)
    };
  };
}

// React imports for the hook (will be available when used in React components)
declare const useState: any;
declare const useEffect: any;