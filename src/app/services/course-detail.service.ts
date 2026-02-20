import { Injectable, signal } from '@angular/core';

export type CourseStatus = 'completed' | 'in-progress' | 'not-started';

@Injectable({ providedIn: 'root' })
export class CourseDetailService {
  readonly selectedCourse = signal<string | null>(null);
  readonly selectedCourseId = signal<number | null>(null);
  readonly courseStatuses = signal<Record<string, CourseStatus>>({});

  open(courseName: string, courseId: number): void {
    this.selectedCourse.set(courseName);
    this.selectedCourseId.set(courseId);
  }

  close(): void {
    this.selectedCourse.set(null);
    this.selectedCourseId.set(null);
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
