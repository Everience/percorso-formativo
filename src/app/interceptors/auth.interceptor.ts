import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.headers.has('Authorization')) {
        return next(req);
    }

    if (!req.url.startsWith(environment.apiUrl)) {
        return next(req);
    }

    const authService = inject(AuthService);

    return from(authService.getIdToken()).pipe(
        switchMap(token => {
            if (token) {
                return next(req.clone({
                    setHeaders: { Authorization: `Bearer ${token}` },
                }));
            }
            return next(req);
        }),
    );
};
