import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminUserService } from '../../services/admin-user.service';
import { AdminUser, PaginatedResponse } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit, OnDestroy {
  private readonly userService = inject(AdminUserService);
  private readonly searchSubject = new Subject<string>();

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly meta = signal({ totalItems: 0, currentPage: 1, totalPages: 1, limit: 12 });

  searchQuery = '';
  roleFilter = '';
  currentSort = 'last_name';

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.meta.update((m) => ({ ...m, currentPage: 1 }));
      this.loadUsers();
    });
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers({
      page: this.meta().currentPage,
      limit: this.meta().limit,
      q: this.searchQuery || undefined,
      role: this.roleFilter || undefined,
      sort: this.currentSort,
    }).subscribe({
      next: (res: PaginatedResponse<AdminUser>) => {
        this.users.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onRoleFilter(role: string): void {
    this.roleFilter = role;
    this.meta.update((m) => ({ ...m, currentPage: 1 }));
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.meta().totalPages) return;
    this.meta.update((m) => ({ ...m, currentPage: page }));
    this.loadUsers();
  }

  toggleSort(column: string): void {
    if (this.currentSort === column) {
      this.currentSort = `-${column}`;
    } else if (this.currentSort === `-${column}`) {
      this.currentSort = column;
    } else {
      this.currentSort = column;
    }
    this.loadUsers();
  }

  sortIcon(column: string): string {
    if (this.currentSort === column) return '\u2191';
    if (this.currentSort === `-${column}`) return '\u2193';
    return '';
  }

  mapRole(dbRole: string): string {
    const map: Record<string, string> = { dev: 'DEV', tech: 'TECH', 'dev-user': 'DEV', 'tech-user': 'TECH' };
    return map[dbRole] ?? dbRole.toUpperCase();
  }

  roleClass(role: string): string {
    if (role === 'dev' || role === 'dev-user') return 'role-pill role-pill--dev';
    if (role === 'tech' || role === 'tech-user') return 'role-pill role-pill--tech';
    return 'role-pill';
  }

  userInitials(user: AdminUser): string {
    const first = (user.first_name?.[0] ?? '').toUpperCase();
    const last = (user.last_name?.[0] ?? '').toUpperCase();
    return first + last;
  }

  get pages(): number[] {
    const m = this.meta();
    const arr: number[] = [];
    const start = Math.max(1, m.currentPage - 2);
    const end = Math.min(m.totalPages, m.currentPage + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }
}
