import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalyticsOverview } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminAnalyticsService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/api/admin/analytics`;

    getOverview(): Observable<AnalyticsOverview> {
        return this.http.get<AnalyticsOverview>(this.base);
    }
}
