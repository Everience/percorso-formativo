import { Injectable, signal } from '@angular/core';

const SIDEBAR_KEY = 'admin-sidebar-collapsed';

@Injectable({ providedIn: 'root' })
export class AdminUiService {
  readonly sidebarCollapsed = signal(this.getStoredSidebarState());

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    localStorage.setItem(SIDEBAR_KEY, String(next));
  }

  private getStoredSidebarState(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  }
}
