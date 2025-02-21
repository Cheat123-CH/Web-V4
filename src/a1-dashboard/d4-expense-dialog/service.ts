import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from 'envs/env';
import { LoadingSpinnerService } from 'helper/shared/loading/service';
import { Observable } from 'rxjs';
import { ExpenseInterface, ExpenseViewInterface } from './interface';
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  getExpenseType(params = {}): Observable<ExpenseInterface>{
    const filteredParams: { [key: string]: any } = {};
        Object.keys(params || {}).forEach(key => {
            if (params![key] !== null && params![key] !== undefined) {
                filteredParams[key] = params![key];

            }
        });
    
    console.log(filteredParams)
    return this._httpClient.get<ExpenseInterface>(`${env.API_BASE_URL}/v1/admin/expenses`, { params: filteredParams })
  }

  viewExpense(id: number): Observable<ExpenseViewInterface>{
    return this._httpClient.get<ExpenseViewInterface>(`${env.API_BASE_URL}/v1/admin/expenses/${id}`)
  }
}
