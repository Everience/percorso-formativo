import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Resource } from '../models/course.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface DashboardCourse extends Course {
  status: string; // 'not_started' | 'in_progress' | 'completed' from backend
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${environment.apiUrl}/api/courses`, {
      params: { category },
    });
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${environment.apiUrl}/api/courses/${id}`);
  }

  getResourcesByCourseId(courseId: number): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${environment.apiUrl}/api/courses/${courseId}/resources`);
  }

  getDashboard(): Observable<DashboardCourse[]> {
    return new Observable<DashboardCourse[]>((subscriber) => {
      this.authService.getIdToken().then((token) => {
        if (!token) {
          subscriber.error(new Error('Not authenticated'));
          return;
        }
        this.http
          .get<DashboardCourse[]>(`${environment.apiUrl}/api/courses/dashboard/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .subscribe(subscriber);
      });
    });
  }

  updateStatus(courseId: number, status: string): Observable<any> {
    return new Observable((subscriber) => {
      this.authService.getIdToken().then((token) => {
        if (!token) {
          subscriber.error(new Error('Not authenticated'));
          return;
        }
        this.http
          .patch(`${environment.apiUrl}/api/courses/${courseId}/status`, { status }, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .subscribe(subscriber);
      });
    });
  }
}
