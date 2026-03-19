import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    readonly state = signal<ConfirmState | null>(null);

    confirm(
        title: string,
        message: string,
        options?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean },
    ): Promise<boolean> {
        return new Promise(resolve => {
            this.state.set({ title, message, resolve, ...options });
        });
    }

    accept(): void {
        this.state()?.resolve(true);
        this.state.set(null);
    }

    cancel(): void {
        this.state()?.resolve(false);
        this.state.set(null);
    }
}
