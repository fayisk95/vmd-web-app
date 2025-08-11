import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, UserRole, LoginRequest, AuthResponse, JwtPayload } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Mock users database
  private mockUsers: User[] = [
    {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 2,
      email: 'manager@example.com',
      name: 'Manager User',
      role: UserRole.MANAGER,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 3,
      email: 'driver@example.com',
      name: 'Driver User',
      role: UserRole.DRIVER,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    
    if (token && userJson && this.isTokenValid(token)) {
      const user = JSON.parse(userJson);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Simulate API call with delay
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Find user by email
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        // Simple password validation (in real app, this would be handled by backend)
        const validPasswords: { [key: string]: string } = {
          'admin@example.com': 'admin123',
          'manager@example.com': 'manager123',
          'driver@example.com': 'driver123'
        };

        if (!user || validPasswords[credentials.email] !== credentials.password) {
          throw new Error('Invalid email or password');
        }

        // Generate mock JWT token
        const token = this.generateMockToken(user);
        const refreshToken = this.generateMockRefreshToken(user);

        const authResponse: AuthResponse = {
          user,
          token,
          refreshToken
        };

        // Store auth data
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));

        // Update subjects
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        return authResponse;
      }),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    
    if (!refreshToken || !userJson) {
      return throwError(() => new Error('No refresh token available'));
    }

    return of(null).pipe(
      delay(500),
      map(() => {
        const user = JSON.parse(userJson);
        const newToken = this.generateMockToken(user);
        const newRefreshToken = this.generateMockRefreshToken(user);

        localStorage.setItem(this.TOKEN_KEY, newToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, newRefreshToken);

        return {
          user,
          token: newToken,
          refreshToken: newRefreshToken
        };
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid(token) : false;
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      iat: Math.floor(Date.now() / 1000)
    };
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa('mock-signature');
    
    return `${header}.${encodedPayload}.${signature}`;
  }

  private generateMockRefreshToken(user: User): string {
    return btoa(`refresh-${user.id}-${Date.now()}`);
  }

  private isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1])) as JwtPayload;
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }
}