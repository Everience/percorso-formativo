import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, AdminCourse, AdminResource } from '../../models/admin.model';

export interface CourseListParams {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    sort?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminCourseService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/admin/courses`;

    getCourses(params: CourseListParams = {}): Observable<PaginatedResponse<AdminCourse>> {
        let httpParams = new HttpParams();
        if (params.page) httpParams = httpParams.set('page', params.page);
        if (params.limit) httpParams = httpParams.set('limit', params.limit);
        if (params.q) httpParams = httpParams.set('q', params.q);
        if (params.category) httpParams = httpParams.set('category', params.category);
        if (params.sort) httpParams = httpParams.set('sort', params.sort);

        return this.http.get<PaginatedResponse<AdminCourse>>(this.base, { params: httpParams });
    }

    getCourseById(id: number): Observable<AdminCourse> {
        return this.http.get<AdminCourse>(`${this.base}/${id}`);
    }

    createCourse(data: Partial<AdminCourse>): Observable<{ message: string; id: number }> {
        return this.http.post<{ message: string; id: number }>(this.base, data);
    }

    updateCourse(id: number, data: Partial<AdminCourse>): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(`${this.base}/${id}`, data);
    }

    deleteCourse(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.base}/${id}`);
    }

    getResources(courseId: number): Observable<AdminResource[]> {
        return this.http.get<AdminResource[]>(`${this.base}/${courseId}/resources`);
    }

    createResource(courseId: number, data: Partial<AdminResource>): Observable<{ message: string; id: number }> {
        return this.http.post<{ message: string; id: number }>(`${this.base}/${courseId}/resources`, data);
    }

    updateResource(courseId: number, resourceId: number, data: Partial<AdminResource>): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(`${this.base}/${courseId}/resources/${resourceId}`, data);
    }

    deleteResource(courseId: number, resourceId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.base}/${courseId}/resources/${resourceId}`);
    }

    reorderResources(courseId: number, orderedIds: number[]): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.base}/${courseId}/resources/reorder`, { orderedIds });
    }
}
