import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.model';
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
}
