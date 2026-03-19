import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminAnalyticsService } from '../../services/admin-analytics.service';
import { AnalyticsOverview, CourseStats } from '../../../models/admin.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly analytics = inject(AdminAnalyticsService);

  readonly loading = signal(true);
  readonly data = signal<AnalyticsOverview | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.analytics.getOverview().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Errore nel caricamento delle analytics.'); this.loading.set(false); },
    });
  }

  barPct(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
  }

  rateClass(rate: number): string {
    if (rate >= 40) return 'rate--high';
    if (rate >= 15) return 'rate--mid';
    return 'rate--low';
  }

  cleanTitle(title: string): string {
    return (title || '').replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  courseRows(stats: CourseStats[]): CourseStats[] {
    return stats.filter((c) => !c.isCertification);
  }
}
