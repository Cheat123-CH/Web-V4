import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { env } from 'envs/env';
import { Observable, of, switchMap } from 'rxjs';
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
    // Method to sign in a user in the POS system
    signIn(credentials: { username: string; password: string; platform?: string }): Observable<ResponseLogin> {
        // Set default platform to "Web" if not provided
        const { username, password, platform = 'Web' } = credentials;

        const requestBody = {
            username,
            password,
            platform,
        };

        return this._httpClient.post<ResponseLogin>(`${env.API_BASE_URL}/account/auth/login`, requestBody).pipe(
            switchMap((response: ResponseLogin) => {
                this.accessToken = response.token; // Store the access token
                return of(response); // Return the response as a new observable
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
