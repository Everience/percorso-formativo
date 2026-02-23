import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.initializing()) {
        await waitUntilReady(auth);
    }

    if (auth.isLoggedIn()) {
        return true;
    }

    return router.createUrlTree(['/login']);
};

function waitUntilReady(auth: AuthService): Promise<void> {
    return new Promise((resolve) => {
        const check = setInterval(() => {
            if (!auth.initializing()) {
                clearInterval(check);
                resolve();
            }
        }, 50);
    });
}
