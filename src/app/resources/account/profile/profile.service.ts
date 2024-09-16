import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { env } from 'envs/env';
import { Observable } from 'rxjs';
import { PasswordUpdate, ProfileUpdate, ResponseProfile } from './profile.type';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {

    private readonly baseUrl: string = env.API_BASE_URL; // Base URL from environment
    private readonly httpOptions = {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
    };

    constructor(private http: HttpClient) { }

    // Update profile endpoint
    profile(body: ProfileUpdate): Observable<ResponseProfile> {
        return this.http.put<ResponseProfile>(`${this.baseUrl}/account/profile/update`, body, this.httpOptions);
    }

    // Update password endpoint
    password(body: PasswordUpdate): Observable<{ statusCode: number, message: string }> {
        return this.http.put<{ statusCode: number, message: string }>(`${this.baseUrl}/api/account/profile/pwd`, body, this.httpOptions);
    }

    // Share variable
    private _sharedVariable = new BehaviorSubject<string>('profile');

    // Observable for the BehaviorSubject which components can subscribe to
    sharedVariable$ = this._sharedVariable.asObservable();

    // Method to update the variable's value
    updateSharedVariable(newValue: string): void {
        console.log('Updating shared variable with:', newValue);
        this._sharedVariable.next(newValue);
    }
}
