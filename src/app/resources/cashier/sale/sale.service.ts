// ================================================================>> Core Library (Angular)
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

// ================================================================>> Third-Party Library (RxJS)
import { catchError, Observable, of, switchMap, tap } from 'rxjs';

// ================================================================>> Custom Library
import { env } from 'envs/env';
import { LoadingSpinnerService } from 'helper/shared/loading/service';
import { List } from './sale.types';


@Injectable({
    providedIn: 'root',
})
export class SaleService {

    constructor(private httpClient: HttpClient) { }
    private loadingSpinner = inject(LoadingSpinnerService);
    list(params?: { page: number, page_size: number, key?: string }): Observable<List> {
        return this.httpClient.get<List>(`${env.API_BASE_URL}/cashier/sales`, { params: params }).pipe(
            switchMap((response: List) => {
                this.loadingSpinner.open();
                return of(response);
            }),
            catchError((error) => {
                this.loadingSpinner.close();
                return new Observable(observer => {
                    observer.error(error);
                    observer.complete();
                });
            }),
            tap((_response: List) => {
                this.loadingSpinner.close();
            })
        );
    }

    delete(id: number = 0): Observable<{ status_code: number, message: string }> {
        return this.httpClient.delete<{ status_code: number, message: string }>(`${env.API_BASE_URL}/sales/${id}`);
    }
}
