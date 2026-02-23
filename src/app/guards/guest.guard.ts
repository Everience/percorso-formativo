import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects guest-only routes (login, signup).
 * If the user is already logged in, redirects to their role page.
 */
export const guestGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Wait for the initial Firebase onAuthStateChanged to resolve
    if (auth.initializing()) {
        await waitUntilReady(auth);
    }

    if (!auth.isLoggedIn()) {
        return true;
    }

    const role = auth.userRole();
    return router.createUrlTree([`/${role ?? 'dev'}`]);
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
