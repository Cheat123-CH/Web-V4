import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { env } from 'envs/env';
import { ResponseLogin } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private _httpClient = inject(HttpClient);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     *
     * @param credentials
    */
    signIn(credentials: { username: string; password: string }): Observable<ResponseLogin> {
        return this._httpClient.post(`${env.API_BASE_URL}/account/auth/login`, credentials).pipe(
            switchMap((response: ResponseLogin) => {
                this.accessToken = response.token;
                // Return a new observable with the response
                return of(response);
            }),
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<boolean> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        // Return the observable
        return of(true);
    }
}
