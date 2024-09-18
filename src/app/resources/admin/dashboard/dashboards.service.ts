import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResponse, DataCashierResponse } from './interface';
// Helper
// ================================================================================>> Thrid Party Library
// RxJS
import { env } from 'envs/env';
@Injectable({ providedIn: 'root' })
export class DashbordService {

    constructor(private _httpClient: HttpClient) { }
    private httpOptions = {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
    }

    getStaticData(
        today?: string,
        yesterday?: string,
        thisWeek?: string,
        thisMonth?: string
    ): Observable<DashboardResponse> {
        // Construct HttpParams
        let params = new HttpParams();
        if (today) params = params.set('today', today);
        if (yesterday) params = params.set('yesterday', yesterday);
        if (thisWeek) params = params.set('thisWeek', thisWeek);
        if (thisMonth) params = params.set('thisMonth', thisMonth);

        // Make the HTTP GET request with HttpParams
        return this._httpClient.get<DashboardResponse>(`${env.API_BASE_URL}/admin/dashboard`, { params });
    }
    getCashier(
        today?: string,
        yesterday?: string,
        thisWeek?: string,
        thisMonth?: string
    ): Observable<DataCashierResponse> {
        // Construct HttpParams
        let params = new HttpParams();
        if (today) params = params.set('today', today);
        if (yesterday) params = params.set('yesterday', yesterday);
        if (thisWeek) params = params.set('thisWeek', thisWeek);
        if (thisMonth) params = params.set('thisMonth', thisMonth);

        // Make the HTTP GET request with HttpParams
        return this._httpClient.get<DataCashierResponse>(`${env.API_BASE_URL}/admin/dashboard/cashier`, { params });
    }


}

