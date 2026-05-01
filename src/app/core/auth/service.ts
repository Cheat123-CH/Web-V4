import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { env } from 'envs/env';
import { Observable, of, switchMap } from 'rxjs';
import { ResponseLogin, ResponseSuccessfullLogin } from './interface';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private _httpClient = inject(HttpClient);

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    signIn(credentials: { username: string; password: string; platform?: string }): Observable<ResponseLogin> {
        const { username, password, platform = 'Web' } = credentials;

        const requestBody = { username, password, platform };

        return this._httpClient.post<ResponseLogin>(
            `${env.API_BASE_URL}/account/auth/login`,
            requestBody
        ).pipe(
            switchMap((response: ResponseLogin) => {
                this.accessToken = response.token;
                return of(response);
            }),
        );
    }

    checkExistUser(credentials: { username: string }): Observable<{ data: boolean; message: string }> {
        const { username } = credentials;

        const requestBody = { username };

        return this._httpClient.post<{ data: boolean; message: string }>(
            `${env.API_BASE_URL}/account/auth/check-user`,
            requestBody
        ).pipe(
            switchMap((response) => {
                return of(response);
            }),
        );
    }

    sendOtp(credentials: { username: string }): Observable<{ status: boolean; message: string }> {
        return this._httpClient.post<{ status: boolean; message: string }>( // ✅ added generic type
            `${env.API_BASE_URL}/account/auth/send-otp`,
            credentials
        ).pipe(
            switchMap((response) => {
                return of(response);
            }),
        );
    }

    verifyOtp(credentials: { username: string; otp: string; platform?: string }): Observable<ResponseSuccessfullLogin> {
        const { username, otp, platform = 'Web' } = credentials;

        const requestBody = { username, otp, platform };

        return this._httpClient.post<ResponseSuccessfullLogin>(
            `${env.API_BASE_URL}/account/auth/verify-otp`,
            requestBody
        ).pipe(
            switchMap((response: ResponseSuccessfullLogin) => {
                this.accessToken = response.token;
                return of(response);
            }),
        );
    }

    signOut(): Observable<boolean> {
        localStorage.removeItem('accessToken');
        return of(true);
    }
}