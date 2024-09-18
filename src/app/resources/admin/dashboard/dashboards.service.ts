import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { DashboardResponse } from './interface';
// Helper
// ================================================================================>> Thrid Party Library
// RxJS
import { env } from 'envs/env';
import { DocumentData } from './documents.interface';
@Injectable({ providedIn: 'root' })
export class DashbordService {

    constructor(private _httpClient: HttpClient) { }
    private httpOptions = {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
    };

    setup(): Observable<{
        docCategory: { id: number, name: string, is_license: boolean }[],
        newDocNumber: { doc_number: string }
    }> {
        return this._httpClient.get<{
            docCategory: { id: number, name: string, is_license: boolean }[],
            newDocNumber: { doc_number: string }
        }>(`${env.API_BASE_URL}/editor/dashboard/setup`);
    }

    getStaticDataDucument(
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
        return this._httpClient.get<DashboardResponse>(`${env.API_BASE_URL}/editor/dashboard`, { params });
    }

    listDocumentsAll(): Observable<DocumentData> {
        return this._httpClient.get<DocumentData>(`${env.API_BASE_URL}/editor/dashboard/all-documents`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return new Observable(observer => {
                    observer.error(error);
                    observer.complete();
                }) as Observable<DocumentData>;
            })
        );
    }
    listDocumentsDraff(): Observable<DocumentData> {
        return this._httpClient.get<DocumentData>(`${env.API_BASE_URL}/editor/dashboard/draff-documents`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return new Observable(observer => {
                    observer.error(error);
                    observer.complete();
                }) as Observable<DocumentData>;
            })
        );
    }
    listDocumentsCompeted(): Observable<DocumentData> {
        return this._httpClient.get<DocumentData>(`${env.API_BASE_URL}/editor/dashboard/competed-documents`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return new Observable(observer => {
                    observer.error(error);
                    observer.complete();
                }) as Observable<DocumentData>;
            })
        );
    }
    listDocumentsCopy(): Observable<DocumentData> {
        return this._httpClient.get<DocumentData>(`${env.API_BASE_URL}/editor/dashboard/copy-documents`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return new Observable(observer => {
                    observer.error(error);
                    observer.complete();
                }) as Observable<DocumentData>;
            })
        );
    }

    create(data: FormData): Observable<{ message: string, data: DocumentData }> {
        return this._httpClient.post<{ message: string, data: DocumentData }>(`${env.API_BASE_URL}/editor/dashboard/documents`, data);
    }
    // update(id: number, data: CreateServiceRequest): Observable<{ message: string, data: ServicesItem }> {
    //     return this._httpClient.put<{ message: string, data: ServicesItem }>(`${env.API_BASE_URL}/admin/services/${id}`, data);
    // }
    update() { }
}

