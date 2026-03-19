import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, AdminUser, UserProgress } from '../../models/admin.model';

export interface UserListParams {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    sort?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/admin/users`;

    getUsers(params: UserListParams = {}): Observable<PaginatedResponse<AdminUser>> {
        let httpParams = new HttpParams();
        if (params.page) httpParams = httpParams.set('page', params.page);
        if (params.limit) httpParams = httpParams.set('limit', params.limit);
        if (params.q) httpParams = httpParams.set('q', params.q);
        if (params.role) httpParams = httpParams.set('role', params.role);
        if (params.sort) httpParams = httpParams.set('sort', params.sort);

        return this.http.get<PaginatedResponse<AdminUser>>(this.base, { params: httpParams });
    }

    getUserById(id: number): Observable<AdminUser> {
        return this.http.get<AdminUser>(`${this.base}/${id}`);
    }

    updateUserRole(id: number, role: string): Observable<{ message: string; newRole: string }> {
        return this.http.patch<{ message: string; newRole: string }>(`${this.base}/${id}`, { role });
    }

    getUserProgress(id: number): Observable<UserProgress[]> {
        return this.http.get<UserProgress[]>(`${this.base}/${id}/progress`);
    }
}
