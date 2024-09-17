// ================================================================================>> Core Library
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

// ================================================================================>> Thrid Party Library
// RxJS
import { BehaviorSubject, Observable, catchError, delayWhen, timer } from 'rxjs';

// ================================================================================>> Custom Library
// Environment
import { env } from 'envs/env';

// Local
import { List, RequestPutUser, RequestUser, ResponseUser, User } from './interface';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    private _items: BehaviorSubject<List | null> = new BehaviorSubject(null);

    private url: string = env.API_BASE_URL;
    private httpOptions = {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
    };

    constructor(private httpClient: HttpClient) { }

    set items(value: List) {
        this._items.next(value);
    }
    get items$(): Observable<List> {
        return this._items.asObservable();
    }

    list(params?: { page: number, page_size: number, key?: string }): Observable<List> {
        const requestStartTime = Date.now();
        return this.httpClient.get<List>(`${env.API_BASE_URL}/admin/users`, { params: params }).pipe(
            // Only add a delay if the request finishes in less than 1 seconds
            delayWhen(() => {
                const timeElapsed = Date.now() - requestStartTime;
                if (timeElapsed < 1000) {
                    return timer(1000 - timeElapsed);
                } else {
                    return timer(0); // No delay
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return new Observable(observer => {
                    observer.error(error);
                    observer.complete();
                }) as Observable<List>;
            })
        );
    }

    view1(id: number): Observable<{ data: User }> {
        return this.httpClient.get<{ data: User }>(this.url + '/admin/users/view/' + id, this.httpOptions);
    }
    view(id: number): Observable<any> {
        return this.httpClient.get<any>(`${env.API_BASE_URL}/admin/users/view/${id}`);
    }
    create(body: RequestUser): Observable<ResponseUser> {
        return this.httpClient.post<ResponseUser>(this.url + '/admin/users', body, this.httpOptions);
    }

    update(id: number = 0, body: RequestPutUser): Observable<{ statusCode: number, data: User, message: string }> {
        return this.httpClient.patch<{ statusCode: number, data: User, message: string }>(this.url + '/admin/users/' + id, body, this.httpOptions);
    }

    delete(id: number = 0): any {
        return this.httpClient.delete(this.url + '/admin/users/' + id, this.httpOptions);
    }

    updateStatus(id: number = 0, body: { is_active: boolean }): Observable<{ statusCode: number, message: string }> {
        return this.httpClient.put<{ statusCode: number, message: string }>(`${this.url}/admin/users/status/${id}`, body, this.httpOptions);
    }

    updatePassword(body: any): Observable<any> {
        return this.httpClient.put(`${env.API_BASE_URL}/general-manager/administrators/update-password`, body);
    }
}
