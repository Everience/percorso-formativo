import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects routes that require authentication.
 * Waits for the initial auth-state check to complete before deciding.
 * If the user is not logged in, redirects to /login.
 */
export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Wait for the initial Firebase onAuthStateChanged to resolve
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
