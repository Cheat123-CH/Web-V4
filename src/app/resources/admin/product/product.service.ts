// ================================================================>> Core Library (Angular)
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import * as core from '@angular/core';

// ================================================================>> Third party Library
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';

// ================================================================>> Custom Library (Application-specific)
import { env } from 'envs/env';
import { DataSaleResponse } from '../dashboard/interface';
import { Data, List, SetupResponse } from './product.types';

@core.Injectable({
    providedIn: 'root',
})

export class ProductService {

    constructor(private httpClient: HttpClient) { };
    // Method to fetch initial setup data for products
    setup(): Observable<SetupResponse> {
        return this.httpClient.get<SetupResponse>(`${env.API_BASE_URL}/admin/products/setup`);
    }

    list(params?: {
        page: number;
        page_size: number;
        key?: string;
        timeType?: string;
        creator_id?: number;
        type_id?: number;
        startDate?: string;
        endDate?: string
    }): Observable<List> {
        // Filter out null or undefined parameters
        const filteredParams: { [key: string]: any } = {};
        Object.keys(params || {}).forEach(key => {
            if (params![key] !== null && params![key] !== undefined) {
                filteredParams[key] = params![key];
            }
        });

        return this.httpClient.get<List>(`${env.API_BASE_URL}/admin/products`, { params: filteredParams }).pipe(
            switchMap((response: List) => of(response)),
            catchError((error: HttpErrorResponse) => {
                // Rethrow the error while maintaining the Observable<List> type
                return throwError(() => error);
            })
        );
    }

    // Method to create a new product
    create(body: { code: string, name: string, type_id: number, image: string }): Observable<{ data: Data, message: string }> {
        return this.httpClient.post<{ data: Data, message: string }>(`${env.API_BASE_URL}/admin/products`, body, {
            headers: new HttpHeaders().set('Content-Type', 'application/json')
        });
    }

    // Method to update an existing product
    update(id: number, body: { code: string, name: string, type_id: number, image?: string }): Observable<{ data: Data, message: string }> {
        return this.httpClient.put<{ data: Data, message: string }>(`${env.API_BASE_URL}/admin/products/${id}`, body, {
            headers: new HttpHeaders().set('Content-Type', 'application/json')
        });
    }

    // Method to delete a product by ID
    delete(id: number = 0): Observable<{ status_code: number, message: string }> {
        return this.httpClient.delete<{ status_code: number, message: string }>(`${env.API_BASE_URL}/admin/products/${id}`);
    }

    getDataProductReport(): Observable<any> {
        const params = new HttpParams()
        return this.httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/share/report/product`, { params });
    }

    view(id: number): Observable<any> {
        return this.httpClient.get<any>(`${env.API_BASE_URL}/admin/products/${id}`);
    }
}
