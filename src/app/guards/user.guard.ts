import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const userGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.initializing()) {
        await waitUntilReady(auth);
    }

    if (!auth.isLoggedIn()) {
        return router.createUrlTree(['/login']);
    }

    if (auth.userRole() === 'admin') {
        return router.createUrlTree(['/admin']);
    }

    return true;
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
