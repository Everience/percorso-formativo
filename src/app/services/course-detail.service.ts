import { Injectable, signal } from '@angular/core';

export type CourseStatus = 'completed' | 'in-progress' | 'not-started';

@Injectable({ providedIn: 'root' })
export class CourseDetailService {
  readonly selectedCourse = signal<string | null>(null);
  readonly courseStatuses = signal<Record<string, CourseStatus>>({});

  open(courseName: string): void {
    this.selectedCourse.set(courseName);
  }

  close(): void {
    this.selectedCourse.set(null);
  }

  getStatus(courseName: string): CourseStatus {
    return this.courseStatuses()[courseName] ?? 'not-started';
  }

  setStatus(courseName: string, status: CourseStatus): void {
    this.courseStatuses.update(statuses => ({
      ...statuses,
      [courseName]: status,
    }));
  }
}
