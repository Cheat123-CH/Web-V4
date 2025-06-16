// ================================================================>> Core Library (Angular)
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

// ================================================================>> Third-Party Library (RxJS)
import { Observable, catchError, of, switchMap, tap } from 'rxjs';

// ================================================================>> Custom Library
import { env } from 'envs/env';
import { Data, Item, CreatePayload, UpdatePayload} from './interface';

// Injectable decorator is used to define the service as a provider
@Injectable({
    providedIn: 'root',
})

export class ProductTypeService {

    private _httpOptions = {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
    };

    constructor(private _httpClient: HttpClient) { }

    getData(){
        return this._httpClient.get<Data>(`${env.API_BASE_URL}/admin/product/types`, { headers: this._httpOptions.headers });
    }

    create(req: CreatePayload): Observable<{ data: Item, message: string }> {
        return this._httpClient.post<{ data: Item, message: string }>(`${env.API_BASE_URL}/admin/product/types`, req, this._httpOptions);
    }

    update(id: number, req: UpdatePayload): Observable<{ data: Item, message: string }> {
        return this._httpClient.post<{ data: Item, message: string }>(`${env.API_BASE_URL}/admin/product/types`, req, this._httpOptions);
    }

    // Method to create a new product type
    // create(body: { name: string, image: string }): Observable<{ data: Data, message: string }> {
    //     return this._httpClient.post<{ data: Data, message: string }>(`${env.API_BASE_URL}/admin/products/types`, body, {
    //         headers: new HttpHeaders().set('Content-Type', 'application/json')
    //     });
    // }

    // Method to update an existing product type
    // update(id: number, body: { name: string, image: string }): Observable<{ data: Data, message: string }> {
    //     return this._httpClient.put<{ data: Data, message: string }>(`${env.API_BASE_URL}/admin/products/types/${id}`, body, {
    //         headers: new HttpHeaders().set('Content-Type', 'application/json')
    //     });
    // }

    // Method to delete an existing product type
    delete(id: number = 0): Observable<{ status_code: number, message: string }> {
        return this._httpClient.delete<{ status_code: number, message: string }>(`${env.API_BASE_URL}/admin/products/types/${id}`, {
            headers: new HttpHeaders().set('Content-Type', 'application/json')
        });
    }
}
