import { Component, inject, signal, OnInit, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../services/admin-user.service';
import { ToastService } from '../../../services/toast.service';
import { AdminUser, UserProgress } from '../../../models/admin.model';

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail implements OnInit {
  readonly id = input.required<string>();

  private readonly userService = inject(AdminUserService);
  private readonly toast = inject(ToastService);

  readonly user = signal<AdminUser | null>(null);
  readonly allProgress = signal<UserProgress[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  selectedRole = '';

  readonly devCourses = computed(() =>
    this.allProgress().filter((p) => p.category === 'DEV' && !this.isCert(p))
  );

  readonly techCourses = computed(() =>
    this.allProgress().filter((p) => p.category === 'TECH' && !this.isCert(p))
  );

  readonly primaryCategory = computed(() => {
    const role = this.user()?.role ?? '';
    return this.roleToCat(role) || 'DEV';
  });

  readonly primaryCourses = computed(() =>
    this.primaryCategory() === 'DEV' ? this.devCourses() : this.techCourses()
  );

  readonly secondaryCourses = computed(() =>
    this.primaryCategory() === 'DEV' ? this.techCourses() : this.devCourses()
  );

  readonly secondaryCategory = computed(() =>
    this.primaryCategory() === 'DEV' ? 'TECH' : 'DEV'
  );

  ngOnInit(): void {
    const userId = Number(this.id());
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.selectedRole = this.mapRole(user.role);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.userService.getUserProgress(userId).subscribe({
      next: (progress) => {
        const cleaned = progress.map((item) => ({
          ...item,
          title: this.cleanTitle(item.title),
          category: (item.category || '').toString().toUpperCase(),
        }));
        cleaned.sort((a, b) => a.position_row - b.position_row || a.display_order - b.display_order);
        this.allProgress.set(cleaned);
      },
    });
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  get currentMappedRole(): string {
    return this.mapRole(this.user()?.role ?? '');
  }

  saveRole(): void {
    const userId = Number(this.id());
    if (!this.selectedRole) return;
    this.saving.set(true);
    this.userService.updateUserRole(userId, this.selectedRole).subscribe({
      next: () => {
        this.toast.success('Ruolo aggiornato con successo');
        this.saving.set(false);
        this.user.update((u) => u ? { ...u, role: this.selectedRole } : null);
      },
      error: () => {
        this.toast.error('Errore nell\'aggiornamento del ruolo');
        this.saving.set(false);
      },
    });
  }

  stats(courses: UserProgress[]) {
    const total = courses.length;
    const completed = courses.filter((c) => c.status === 'completed').length;
    const inProgress = courses.filter((c) => c.status === 'in_progress').length;
    const notStarted = total - completed - inProgress;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, notStarted, pct };
  }

  get globalStats() {
    const all = [...this.devCourses(), ...this.techCourses()];
    return this.stats(all);
  }

  statusDot(status: string): string {
    if (status === 'completed') return 'dot--completed';
    if (status === 'in_progress') return 'dot--progress';
    return 'dot--not-started';
  }

  statusText(status: string): string {
    const map: Record<string, string> = { completed: 'Completato', in_progress: 'In corso', not_started: 'Da iniziare' };
    return map[status] ?? status;
  }

  mapRole(role: string): string {
    const map: Record<string, string> = { 'dev-user': 'dev', 'tech-user': 'tech', admin: 'admin' };
    return map[role] ?? role;
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = { dev: 'DEV', tech: 'TECH', 'dev-user': 'DEV', 'tech-user': 'TECH' };
    return map[role] ?? role.toUpperCase();
  }

  private roleToCat(role: string): string {
    const map: Record<string, string> = { dev: 'DEV', tech: 'TECH', 'dev-user': 'DEV', 'tech-user': 'TECH' };
    return map[role] ?? '';
  }

  private isCert(item: UserProgress): boolean {
    return !item.description || item.description.trim() === '';
  }

  private cleanTitle(title: string): string {
    return (title || '').replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
