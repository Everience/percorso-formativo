import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Resource } from '../models/course.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);

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
}
