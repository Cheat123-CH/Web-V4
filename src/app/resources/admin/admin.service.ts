import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from 'envs/env';
@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private url: string = env.API_BASE_URL;
    private file: string = env.FILE_BASE_URL;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-type': 'application/json',
            'withCredentials': 'true',
        })
    };
    constructor(private http: HttpClient) { }
}
