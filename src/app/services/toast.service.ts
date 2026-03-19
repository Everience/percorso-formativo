import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    readonly toasts = signal<Toast[]>([]);

    show(message: string, type: ToastType = 'info', duration = 3500): void {
        const id = Date.now() + Math.random();
        this.toasts.update(t => [...t, { id, message, type }]);
        setTimeout(() => this.dismiss(id), duration);
    }

    success(message: string): void { this.show(message, 'success'); }
    error(message: string): void { this.show(message, 'error', 5000); }
    warning(message: string): void { this.show(message, 'warning'); }
    info(message: string): void { this.show(message, 'info'); }

    dismiss(id: number): void {
        this.toasts.update(t => t.filter(toast => toast.id !== id));
    }
}
