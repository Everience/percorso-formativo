import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminUserService } from '../../services/admin-user.service';
import { AdminAnalyticsService } from '../../services/admin-analytics.service';
import { AdminUser, PaginatedResponse } from '../../../models/admin.model';
import { isAdminListableMappedRole } from '../../utils/admin-app-user-roles';

/** Fixed page size: pagination only when more than this many users (13+). */
const USERS_LIST_PAGE_SIZE = 12;

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit, OnDestroy {
  /** Exposed for template (pagination only when totalItems exceeds this). */
  readonly listPageSize = USERS_LIST_PAGE_SIZE;

  private readonly userService = inject(AdminUserService);
  private readonly analyticsService = inject(AdminAnalyticsService);
  private readonly searchSubject = new Subject<string>();

  /** Same `users.total` as dashboard KPI (DEV+TECH); loaded from /api/admin/analytics. */
  private readonly dashboardUsersTotal = signal<number | null>(null);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly meta = signal({
    totalItems: 0,
    appUsersTotal: 0,
    /** Rows used for pager math (cohort total on “Tutti” without search). */
    pagingItemTotal: 0,
    currentPage: 1,
    totalPages: 1,
    limit: USERS_LIST_PAGE_SIZE,
  });

  searchQuery = '';
  roleFilter = '';
  currentSort = 'last_name';

  ngOnInit(): void {
    this.analyticsService.getOverview().subscribe({
      next: (d) => this.dashboardUsersTotal.set(Math.trunc(Number(d.users?.total) || 0)),
      error: () => this.dashboardUsersTotal.set(null),
    });
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
      limit: USERS_LIST_PAGE_SIZE,
      q: this.searchQuery || undefined,
      role: this.roleFilter || undefined,
      sort: this.currentSort,
    }).subscribe({
      next: (res: PaginatedResponse<AdminUser>) => {
        const list = res.data.filter((u) => isAdminListableMappedRole(u.role));
        this.users.set(list);
        const m = res.meta;
        const listTotal = Math.trunc(Number(m.totalItems) || 0);
        const nApp = Number(m.appUsersTotal);
        const appTotal =
          m.appUsersTotal != null && !Number.isNaN(nApp) ? Math.trunc(nApp) : listTotal;
        /**
         * “Tutti” + no search: pager must follow DEV+TECH cohort (appUsersTotal), same as toolbar.
         * Otherwise listTotal can disagree (e.g. inflated COUNT) → fake 2nd page + half-empty rows after client filter.
         */
        const noSearch = !this.searchQuery.trim();
        const pagingItemTotal =
          this.roleFilter === '' && noSearch ? appTotal : listTotal;
        const totalPages =
          pagingItemTotal <= 0
            ? 0
            : Math.ceil(pagingItemTotal / USERS_LIST_PAGE_SIZE);
        const serverPage = Math.trunc(Number(m.currentPage) || 1);
        let currentPage = serverPage;
        if (totalPages > 0) {
          currentPage = Math.min(Math.max(1, serverPage), totalPages);
        } else {
          currentPage = 1;
        }
        this.meta.set({
          totalItems: listTotal,
          appUsersTotal: appTotal,
          pagingItemTotal,
          currentPage,
          totalPages,
          limit: USERS_LIST_PAGE_SIZE,
        });
        if (serverPage !== currentPage) {
          this.loadUsers();
          return;
        }
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
    const { totalPages } = this.meta();
    if (page < 1 || totalPages < 1 || page > totalPages) return;
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

  /**
   * Toolbar count: with no search and “Tutti”, use dashboard analytics `users.total` (authoritative).
   * With search only: cohort from users list API. With DEV/TECH chip: paginated subset total.
   */
  toolbarUserCount(): number {
    const m = this.meta();
    const noSearch = !this.searchQuery.trim();
    if (this.roleFilter === '' && noSearch) {
      const dash = this.dashboardUsersTotal();
      if (dash != null) return dash;
    }
    if (this.roleFilter === '') {
      return m.appUsersTotal;
    }
    return m.totalItems;
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
    if (m.totalPages < 1) return arr;
    const start = Math.max(1, m.currentPage - 2);
    const end = Math.min(m.totalPages, m.currentPage + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

}
