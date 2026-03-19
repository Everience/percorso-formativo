import { Injectable, signal } from '@angular/core';

export type AdminTheme = 'light' | 'dark';

const STORAGE_KEY = 'admin-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly theme = signal<AdminTheme>(this.getStoredTheme());

    toggle(): void {
        const next = this.theme() === 'light' ? 'dark' : 'light';
        this.theme.set(next);
        localStorage.setItem(STORAGE_KEY, next);
    }

    setTheme(theme: AdminTheme): void {
        this.theme.set(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    private getStoredTheme(): AdminTheme {
        if (typeof localStorage === 'undefined') return 'light';
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
        return 'light';
    }
}
