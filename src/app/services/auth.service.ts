import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { firebaseConfig } from '../firebase.config';
import { environment } from '../../environments/environment.prod';
import { CourseDetailService } from './course-detail.service';

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

    readonly currentUser = signal<AppUser | null>(null);

    readonly initializing = signal(true);

    readonly isLoggedIn = computed(() => !!this.currentUser());
    readonly userRole = computed(() => this.currentUser()?.role ?? null);

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);

        onAuthStateChanged(this.auth, async (firebaseUser) => {
            this.ngZone.run(async () => {
                if (firebaseUser) {
                    try {
                        const user = await this.fetchBackendUser(firebaseUser);
                        this.currentUser.set(user);
                    } catch {
                        this.currentUser.set(null);
                    }
                } else {
                    this.currentUser.set(null);
                }
                this.initializing.set(false);
            });
        });
    }

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

        await signOut(this.auth);
        this.currentUser.set(null);
    }

    private readonly courseDetailService = inject(CourseDetailService);

    async logOut(): Promise<void> {
        await signOut(this.auth);
        this.currentUser.set(null);
        this.courseDetailService.clearStatuses();
        this.router.navigate(['/login']);
    }

    async resetPassword(email: string): Promise<void> {
        await sendPasswordResetEmail(this.auth, email);
    }

    async getIdToken(): Promise<string | null> {
        const user = this.auth.currentUser;
        return user ? user.getIdToken() : null;
    }

    private async fetchBackendUser(firebaseUser: FirebaseUser): Promise<AppUser> {
        const token = await firebaseUser.getIdToken();
        return firstValueFrom(
            this.http.post<AppUser>(`${environment.apiUrl}/api/users/login`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        );
    }
}
