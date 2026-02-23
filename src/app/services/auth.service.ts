import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { firebaseConfig } from '../firebase.config';
import { environment } from '../../environments/environment';

export interface AppUser {
    id: number;
    uid: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'dev' | 'tech';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly ngZone = inject(NgZone);

    private readonly app: FirebaseApp;
    private readonly auth: Auth;

    /** The current user from our MSSQL database (null = not logged in / loading) */
    readonly currentUser = signal<AppUser | null>(null);

    /** True while the initial auth-state check is running (prevents flash of login page) */
    readonly initializing = signal(true);

    readonly isLoggedIn = computed(() => !!this.currentUser());
    readonly userRole = computed(() => this.currentUser()?.role ?? null);

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);

        // Listen for Firebase auth state changes (handles page refresh / token restore)
        onAuthStateChanged(this.auth, async (firebaseUser) => {
            this.ngZone.run(async () => {
                if (firebaseUser) {
                    try {
                        const user = await this.fetchBackendUser(firebaseUser);
                        this.currentUser.set(user);
                    } catch {
                        // Firebase account exists but no backend record (edge case)
                        this.currentUser.set(null);
                    }
                } else {
                    this.currentUser.set(null);
                }
                this.initializing.set(false);
            });
        });
    }

    /** Sign in with email & password */
    async signIn(email: string, password: string): Promise<AppUser> {
        const credential = await signInWithEmailAndPassword(this.auth, email, password);
        const token = await credential.user.getIdToken();

        const user = await firstValueFrom(
            this.http.post<AppUser>(`${environment.apiUrl}/api/users/login`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        );

        this.currentUser.set(user);
        return user;
    }

    /** Sign up: create Firebase account, register in MSSQL, then sign out so user must login manually */
    async signUp(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        role: 'dev' | 'tech',
    ): Promise<void> {
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        const token = await credential.user.getIdToken();

        await firstValueFrom(
            this.http.post<AppUser>(`${environment.apiUrl}/api/users`, {
                firstName,
                lastName,
                email,
                role,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        );

        // Sign out immediately — user must login manually after registration
        await signOut(this.auth);
        this.currentUser.set(null);
    }

    /** Sign out and navigate to /login */
    async logOut(): Promise<void> {
        await signOut(this.auth);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    /** Get current Firebase ID token (for authenticated HTTP requests) */
    async getIdToken(): Promise<string | null> {
        const user = this.auth.currentUser;
        return user ? user.getIdToken() : null;
    }

    /** Fetch the backend user record using the Firebase user's token */
    private async fetchBackendUser(firebaseUser: FirebaseUser): Promise<AppUser> {
        const token = await firebaseUser.getIdToken();
        return firstValueFrom(
            this.http.post<AppUser>(`${environment.apiUrl}/api/users/login`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        );
    }
}
