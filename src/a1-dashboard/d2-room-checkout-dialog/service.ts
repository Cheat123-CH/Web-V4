import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { env } from 'envs/env';
import { Observable } from 'rxjs';

import { MoveoutInterface, Zone } from './interface';
import { NumberSymbol } from '@angular/common';
import { StringNullableChain } from 'lodash';
@Injectable({
  providedIn: 'root'
})

export class MoveoutService {

  
  constructor(
    private _httpClient: HttpClient,

  ) { }



  getMoveOut(params : {zoneName: String ,search : String}): Observable<MoveoutInterface>{

    const filteredParams: { [key: string]: any } = {};
        Object.keys(params || {}).forEach(key => {
            // Include all values except undefined or null
            if (params![key] !== undefined && params![key] !== null) {
                filteredParams[key] = params![key];
            }
        });
    const httpParams = new HttpParams({ fromObject: filteredParams });
    return this._httpClient.get<MoveoutInterface>(`${env.API_BASE_URL}/v1/admin/dashboard/checkout/checkout`, {params: httpParams} )
  }

  deleteMoveOut(params: {
    transactionId ?: number, 
    roomId        ?: number, 
    renterId      ?: number, 
    checkout_date ?: string, 
    down_payment  ?: number})
  : Observable<any>{
    

    const queryParams = new URLSearchParams();

    if (params.transactionId) queryParams.append('transactionId', params.transactionId.toString());
    if (params.roomId) queryParams.append('roomId', params.roomId.toString());
    if (params.renterId) queryParams.append('renterId', params.renterId.toString());
    if (params.checkout_date) queryParams.append('checkout_date', params.checkout_date);
    if (params.down_payment) queryParams.append('down_payment', params.down_payment.toString());

    return this._httpClient.delete(`${env.API_BASE_URL}/v1/admin/dashboard/checkout?${queryParams.toString()}`);
  }

}
