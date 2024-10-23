import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResponse, DataCashierResponse, DataSaleResponse } from './interface';
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
        year?: string,
        week?: string
    ): Observable<DataCashierResponse> {
        // Construct HttpParams
        let params = new HttpParams();
        if (year) params = params.set('year', year);
        if (week) params = params.set('week', week);

        // Make the HTTP GET request with HttpParams
        return this._httpClient.get<DataCashierResponse>(`${env.API_BASE_URL}/admin/dashboard/cashier`, { params });
    }

    getProductType(
        year?: string,
        week?: string
    ): Observable<any> {
        // Construct HttpParams
        let params = new HttpParams();
        if (year) params = params.set('year', year);
        if (week) params = params.set('week', week);

        // Make the HTTP GET request with HttpParams
        return this._httpClient.get<any>(`${env.API_BASE_URL}/admin/dashboard/product-type`, { params });
    }

    getDataSale(year?: string, week?: string): Observable<DataSaleResponse> {
        let params = new HttpParams();

        // Set params only if values are provided
        if (year) {
            params = params.set('year', year);
        }
        if (week) {
            params = params.set('week', week);
        }

        return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/admin/dashboard/data-sale`, { params });
    }

    getDataSaleReport(startDate?: string, endDate?: string): Observable<any> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/share/report/sale`, { params });
    }

    getDataCashierReport(startDate?: string, endDate?: string): Observable<any> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/share/report/cashier`, { params });
    }

    getDataProductReport(startDate?: string, endDate?: string): Observable<any> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/share/report/product`, { params });
    }

}

