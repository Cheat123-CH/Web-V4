import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceDetail, Invoice, InvoiceInterface} from './invoice';
import { env } from 'envs/env';
import { map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    private _httpClient: HttpClient,
  ) { }

  getInvoiceByZone(params: {zoneName?: string, search?: string}, limit?: number): Observable<Invoice[]> {
    
    const filteredParams: { [key: string]: any } = {};
        Object.keys(params || {}).forEach(key => {
            if (params![key] !== null && params![key] !== undefined) {
                filteredParams[key] = params![key];
            }
        });
    return this._httpClient.get<InvoiceInterface>(`${env.API_BASE_URL}/v1/admin/dashboard/invoices-by-zone`,
      { params: filteredParams }).pipe(
      map(response => response.data) // Extract only the 'data' field
  );
  }

  getInvoiceDetailById(params: {id?: number}): Observable<InvoiceDetail> {
    return this._httpClient.get<InvoiceDetail>(
      `${env.API_BASE_URL}/v1/admin/income/invoices/${params.id}/details`
    );
  }

  invoiceCheckout(id: number): Observable<any> {
    return this._httpClient.put<any>(
      `${env.API_BASE_URL}/v1/admin/income/invoices/paid/${id}`,
      {}
    );
  }


  generatePayment(room_id: number): Observable<any>{
    room_id = 1
    return this._httpClient.get<any>(`${env.API_BASE_URL}/v1/utils/invoice/generate-invoice-by-room/${room_id}`);
  }

  generatePaymentbytransaction(id: number): Observable<any>{
    return this._httpClient.get<any>(`${env.API_BASE_URL}/v1/utils/invoice/generate-invoice-by-id/${id}`);
  }
}
