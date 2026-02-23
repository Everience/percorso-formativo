import { Injectable, signal } from '@angular/core';

export type CourseStatus = 'completed' | 'in-progress' | 'not-started';

const STATUS_TO_BACKEND: Record<CourseStatus, string> = {
  'completed': 'completed',
  'in-progress': 'in_progress',
  'not-started': 'not_started',
};

const STATUS_FROM_BACKEND: Record<string, CourseStatus> = {
  'completed': 'completed',
  'in_progress': 'in-progress',
  'not_started': 'not-started',
};

export function statusFromBackend(backendStatus: string): CourseStatus {
  return STATUS_FROM_BACKEND[backendStatus] ?? 'not-started';
}

export function statusToBackend(frontendStatus: CourseStatus): string {
  return STATUS_TO_BACKEND[frontendStatus] ?? 'not_started';
}

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

  loadStatuses(statusMap: Record<string, CourseStatus>): void {
    this.courseStatuses.set(statusMap);
  }

  clearStatuses(): void {
    this.courseStatuses.set({});
  }
}
