import { Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCourseService } from '../../services/admin-course.service';
import { AdminCourse, CourseCompletionRow } from '../../../models/admin.model';

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'not_started';

@Component({
    selector: 'app-course-completions',
    imports: [RouterLink, FormsModule],
    templateUrl: './course-completions.html',
    styleUrl: './course-completions.scss',
})
export class CourseCompletions implements OnInit {
    readonly id = input.required<string>();

    private readonly courseService = inject(AdminCourseService);

    readonly course = signal<AdminCourse | null>(null);
    readonly rows = signal<CourseCompletionRow[]>([]);
    readonly summary = signal({ total: 0, completed: 0, inProgress: 0, notStarted: 0 });
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    readonly searchQuery = signal('');
    readonly statusFilter = signal<StatusFilter>('all');
    /** Default: completati → in corso → da iniziare, then alphabetical (matches API intent). */
    readonly currentSort = signal<string>('status');

    private readonly filteredRows = computed(() => {
        const q = this.searchQuery().trim().toLowerCase();
        const filter = this.statusFilter();
        return this.rows().filter((row) => {
            if (filter !== 'all' && row.status !== filter) return false;
            if (!q) return true;
            const name = `${row.first_name} ${row.last_name}`.toLowerCase();
            const email = (row.email || '').toLowerCase();
            return name.includes(q) || email.includes(q);
        });
    });

    /** Filtered rows sorted like admin Utenti (click column headers to toggle). */
    readonly tableRows = computed(() => {
        const list = [...this.filteredRows()];
        const sortKey = this.currentSort();
        const desc = sortKey.startsWith('-');
        const col = desc ? sortKey.slice(1) : sortKey;

        const statusRank = (s: string): number => {
            if (s === 'completed') return 0;
            if (s === 'in_progress') return 1;
            return 2;
        };

        list.sort((a, b) => {
            let cmp = 0;
            switch (col) {
                case 'last_name':
                    cmp = (a.last_name ?? '').localeCompare(b.last_name ?? '', 'it', { sensitivity: 'base' });
                    if (cmp === 0) {
                        cmp = (a.first_name ?? '').localeCompare(b.first_name ?? '', 'it', { sensitivity: 'base' });
                    }
                    break;
                case 'email':
                    cmp = (a.email ?? '').localeCompare(b.email ?? '', 'it', { sensitivity: 'base' });
                    break;
                case 'role':
                    cmp = (a.role ?? '').localeCompare(b.role ?? '', 'it', { sensitivity: 'base' });
                    break;
                case 'status':
                    cmp = statusRank(a.status) - statusRank(b.status);
                    if (cmp === 0) {
                        cmp = (a.last_name ?? '').localeCompare(b.last_name ?? '', 'it', { sensitivity: 'base' });
                        if (cmp === 0) {
                            cmp = (a.first_name ?? '').localeCompare(b.first_name ?? '', 'it', { sensitivity: 'base' });
                        }
                    }
                    break;
                default:
                    break;
            }
            return desc ? -cmp : cmp;
        });
        return list;
    });

    readonly isCertification = computed(() => {
        const c = this.course();
        return !c?.description || c.description.trim() === '';
    });

    readonly completionRate = computed(() => {
        const s = this.summary();
        if (s.total <= 0) return 0;
        return Math.round((s.completed / s.total) * 1000) / 10;
    });

    readonly barSegments = computed(() => {
        const s = this.summary();
        const t = s.total;
        if (t <= 0) {
            return { completed: 0, inProgress: 0, notStarted: 100 };
        }
        return {
            completed: (s.completed / t) * 100,
            inProgress: (s.inProgress / t) * 100,
            notStarted: (s.notStarted / t) * 100,
        };
    });

    ngOnInit(): void {
        const courseId = Number(this.id());
        this.courseService.getCourseCompletions(courseId).subscribe({
            next: (res) => {
                this.course.set(res.course);
                this.rows.set(res.rows);
                this.summary.set({
                    total: res.summary.total,
                    completed: res.summary.completed,
                    inProgress: res.summary.inProgress,
                    notStarted: res.summary.notStarted,
                });
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Impossibile caricare gli avanzamenti. Riprova più tardi.');
                this.loading.set(false);
            },
        });
    }

    setFilter(f: StatusFilter): void {
        this.statusFilter.set(f);
    }

    toggleSort(column: string): void {
        const cur = this.currentSort();
        if (cur === column) {
            this.currentSort.set(`-${column}`);
        } else if (cur === `-${column}`) {
            this.currentSort.set(column);
        } else {
            this.currentSort.set(column);
        }
    }

    sortIcon(column: string): string {
        if (this.currentSort() === column) return '\u2191';
        if (this.currentSort() === `-${column}`) return '\u2193';
        return '';
    }

    statusDot(status: string): string {
        if (status === 'completed') return 'dot--completed';
        if (status === 'in_progress') return 'dot--progress';
        return 'dot--not-started';
    }

    statusText(status: string): string {
        const map: Record<string, string> = {
            completed: 'Completato',
            in_progress: 'In corso',
            not_started: 'Da iniziare',
        };
        return map[status] ?? status;
    }

    /** Same mapping as admin Users list */
    mapRole(dbRole: string): string {
        const map: Record<string, string> = { dev: 'DEV', tech: 'TECH', 'dev-user': 'DEV', 'tech-user': 'TECH' };
        return map[dbRole] ?? dbRole.toUpperCase();
    }

    roleClass(role: string): string {
        if (role === 'dev' || role === 'dev-user') return 'role-pill role-pill--dev';
        if (role === 'tech' || role === 'tech-user') return 'role-pill role-pill--tech';
        return 'role-pill';
    }

    userInitials(row: CourseCompletionRow): string {
        const first = (row.first_name?.[0] ?? '').toUpperCase();
        const last = (row.last_name?.[0] ?? '').toUpperCase();
        return first + last || '?';
    }

    clearSearch(): void {
        this.searchQuery.set('');
    }

    fullName(row: CourseCompletionRow): string {
        return `${row.first_name || ''} ${row.last_name || ''}`.replace(/\s+/g, ' ').trim() || '—';
    }

    cleanTitle(title: string): string {
        return (title || '').replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
    }

    formatTitle(title: string): string {
        return (title || '').replace(/\\n|\n/g, '<br>');
    }

    statusPillClass(status: string): string {
        const slug = (status || 'not_started').replace(/_/g, '-');
        return `status-pill status-pill--${slug}`;
    }
}
