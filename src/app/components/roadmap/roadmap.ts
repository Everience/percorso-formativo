import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GlassElem } from '../glass-elem/glass-elem';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';

export interface RoadmapRow {
  isLabel: boolean;
  items: Course[];
  leftHalf: Course[];
  center: Course | null;
  rightHalf: Course[];
}

export type ArrowPattern = 'straight' | 'split-s' | 'merge-s' | 'split-m' | 'split-l';

@Component({
  selector: 'app-roadmap',
  imports: [GlassElem],
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.scss',
})
export class Roadmap {
  readonly category = input.required<string>();
  readonly oppositeRoute = input.required<string>();
  readonly oppositeLabel = input.required<string>();

  private readonly courseService = inject(CourseService);
  private readonly router = inject(Router);

  readonly courses = signal<Course[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly rows = computed<RoadmapRow[]>(() => {
    const courses = this.courses();
    if (courses.length === 0) return [];

    const grouped = new Map<number, Course[]>();
    for (const course of courses) {
      const existing = grouped.get(course.position_row);
      if (existing) {
        existing.push(course);
      } else {
        grouped.set(course.position_row, [course]);
      }
    }

    return [...grouped.keys()]
      .sort((a, b) => a - b)
      .map(key => {
        const items = grouped.get(key)!.sort((a, b) => a.display_order - b.display_order);
        const isLabel = items.every(item => !item.description);

        if (isLabel) {
          return { isLabel: true, items, leftHalf: [], center: null, rightHalf: [] };
        }

        const half = Math.floor(items.length / 2);
        const hasCenter = items.length % 2 === 1;
        const leftHalf = items.slice(0, half);
        const center = hasCenter ? items[half] : null;
        const rightHalf = items.slice(hasCenter ? half + 1 : half);

        return { isLabel: false, items, leftHalf, center, rightHalf };
      });
  });

  constructor() {
    effect(onCleanup => {
      const category = this.category();
      this.loading.set(true);
      this.error.set(null);

      const sub = this.courseService.getCoursesByCategory(category).subscribe({
        next: courses => {
          this.courses.set(courses);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Errore nel caricamento dei corsi.');
          this.loading.set(false);
        },
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  formatTitle(title: string): string {
    return title.replace(/\\n|\n/g, '<br>');
  }

  getArrowPattern(index: number): ArrowPattern {
    const rows = this.rows();
    const prev = rows[index];
    const next = rows[index + 1];

    const prevCount = prev.isLabel ? 1 : prev.items.length;
    const nextCount = next.isLabel ? 1 : next.items.length;

    if (prevCount === 1 && nextCount === 1) return 'straight';
    if (prevCount === 1 && nextCount === 2) return 'split-s';
    if (prevCount === 1 && nextCount === 3) return 'split-m';
    if (prevCount === 1 && nextCount >= 4) return 'split-l';
    if (prevCount === 3 && nextCount === 1) return 'straight';
    if (prevCount > 1 && nextCount === 1) return 'merge-s';

    return 'straight';
  }

  goToOpposite(): void {
    this.router.navigate([this.oppositeRoute()]);
  }
}
