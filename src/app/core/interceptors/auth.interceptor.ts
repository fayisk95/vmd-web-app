import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to requests
    const authToken = this.authService.getToken();
    
    if (authToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Try to refresh token
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with new token
              const newToken = this.authService.getToken();
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next.handle(retryReq);
            }),
            catchError(() => {
              // Refresh failed, logout user
              this.authService.logout();
              return throwError(() => error);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }
}