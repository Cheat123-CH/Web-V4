import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { env } from 'envs/env';
import { FreeRoomInterface, FreeRoom } from './interface';
import { filter } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FreeRoomDialogService {
  
  constructor(private _httpClient: HttpClient ) { }

    getAvailableRooms(params: {freeFrom?: string, zoneName?: string, available?: boolean}): Observable<FreeRoom>{

        const filteredParams: { [key: string]: any } = {};
        Object.keys(params || {}).forEach(key => {
            if (params![key] !== null && params![key] !== undefined) {
                filteredParams[key] = params![key];
            }
        });
      return this._httpClient.get<FreeRoom>(`${env.API_BASE_URL}/v1/admin/dashboard/booking`, { params: filteredParams}
      );
    }


  // reserveRoom with data from reserve dialog
  reserveRoom(param: {move_in?: string, room_id?: string}, body: {name: String, phone: String}): Observable<any>{

    const payload = {
      name: body.name,
      phone: body.phone,
    };

    const params = new HttpParams()
    .set('move_in', param.move_in || '')
    .set('roomId', param.room_id || '');

    console.log('PayLoad: ' , payload)
    console.log('Params', params)
    
    return this._httpClient.post(
      `${env.API_BASE_URL}/v1/admin/dashboard/booking`,
      payload,
      { params } // Attach params to the request
    );
  }

  view(id: number): Observable<any> {
    return this._httpClient.get<any>(`${env.API_BASE_URL}/v1/admin/rooms/${id}`);
  }
}
