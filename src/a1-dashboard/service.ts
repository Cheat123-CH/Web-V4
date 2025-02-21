import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs';
import { BarChart, DashboardResponse, DashboardStatisticsV2, 
    DataCashierResponse, DataSaleResponse, InvoiceInfoInterface, RenterDashboard, 
    RenterDashboardInterface, RenterStatistics, RoomSummary, Zone, 
    ZoneStatisticsResponse, ZoneStatisticsV2 } from './interface';
// Helper
// ================================================================================>> Thrid Party Library
// RxJS
import { env } from 'envs/env';

@Injectable({ providedIn: 'root' })
export class DashbordService {

    constructor(private _httpClient: HttpClient) { }
    private httpOptions = {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
    }

    getStaticData(
        today?: string,
        yesterday?: string,
        thisWeek?: string,
        thisMonth?: string
    ): Observable<DashboardResponse> {
        // Construct HttpParams
        let params = new HttpParams();
        if (today) params = params.set('today', today);
        if (yesterday) params = params.set('yesterday', yesterday);
        if (thisWeek) params = params.set('thisWeek', thisWeek);
        if (thisMonth) params = params.set('thisMonth', thisMonth);

        // Make the HTTP GET request with HttpParams
        return this._httpClient.get<DashboardResponse>(`${env.API_BASE_URL}/admin/dashboard`, { params });
    }

    // getCashier(
    //     today?: string,
    //     yesterday?: string,
    //     thisWeek?: string,
    //     thisMonth?: string
    // ): Observable<DataCashierResponse> {
    //     // Construct HttpParams
    //     let params = new HttpParams();
    //     if (today) params = params.set('today', today);
    //     if (yesterday) params = params.set('yesterday', yesterday);
    //     if (thisWeek) params = params.set('thisWeek', thisWeek);
    //     if (thisMonth) params = params.set('thisMonth', thisMonth);

    //     // Make the HTTP GET request with HttpParams
    //     return this._httpClient.get<DataCashierResponse>(`${env.API_BASE_URL}/admin/dashboard/cashier`, { params });
    // }

    // getProductType(params: { thisWeek?: string; thisMonth?: string; threeMonthAgo?: string; sixMonthAgo?: string }): Observable<any> {
    //     // Filter out undefined or empty values
    //     const filteredParams = Object.fromEntries(
    //         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    //     );

    //     return this._httpClient.get<any>(`${env.API_BASE_URL}/admin/dashboard/product-type`, { params: filteredParams });
    // }


    // getDataSale(params: { thisWeek?: string; thisMonth?: string; threeMonthAgo?: string; sixMonthAgo?: string }): Observable<DataSaleResponse> {
    //     // Filter out undefined or empty values
    //     const filteredParams = Object.fromEntries(
    //         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    //     );

    //     return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/admin/dashboard/data-sale`, { params: filteredParams });
    // }


    // getDataSaleReport(startDate?: string, endDate?: string): Observable<any> {
    //     const params = new HttpParams()
    //         .set('startDate', startDate)
    //         .set('endDate', endDate);
    //     return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/share/report/sale`, { params });
    // }

    // getDataCashierReport(startDate?: string, endDate?: string): Observable<any> {
    //     const params = new HttpParams()
    //         .set('startDate', startDate)
    //         .set('endDate', endDate);
    //     return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/share/report/cashier`, { params });
    // }

    // getDataProductReport(startDate?: string, endDate?: string): Observable<any> {
    //     const params = new HttpParams()
    //         .set('startDate', startDate)
    //         .set('endDate', endDate);
    //     return this._httpClient.get<DataSaleResponse>(`${env.API_BASE_URL}/share/report/product`, { params });
    // }


    //  use behavior subject to update component after room reservation
    private refresh: BehaviorSubject<() => void | null> = new BehaviorSubject<() => void | null>(null);

    public getRefresh(): Observable<() => void | null> {
        return this.refresh.asObservable();
    }

    public setRefresh(callback: () => void): void {
        this.refresh.next(callback);
    }

    getRoomSummary(): Observable<RoomSummary> {
        return this._httpClient.get<RoomSummary>(`${env.API_BASE_URL}/v1/admin/dashboard/room-statistics`);
    }

    getZoneStatistic(): Observable<ZoneStatisticsResponse>{
        return this._httpClient.get<ZoneStatisticsResponse>(`${env.API_BASE_URL}/v1/admin/dashboard/zone-statistics`);
    }

    getRenterDashboard(): Observable<RenterStatistics>{
        return this._httpClient.get<RenterStatistics>(`${env.API_BASE_URL}/v1/admin/dashboard/renter-statistics`);
    }

    getBarStatistics(year?: number): Observable<BarChart>{
        return this._httpClient.get<BarChart>(`${env.API_BASE_URL}/v1/admin/dashboard/income-outcome?year=${year}`);
    }
    

    // Get Zone Name and ID for selection
    getZoneName(): Observable<any> {
        return this._httpClient.get<any>(`${env.API_BASE_URL}/v1/admin/zones`);
      }
    
    getZoneSelection(): Observable<any> {
    return this._httpClient.get<any>(`${env.API_BASE_URL}/v1/admin/zones`).pipe(
        map(zoneInterface => zoneInterface.data)
    )
    }
    
      deleteRenter(renterId): Observable<any>{
        return this._httpClient.delete<any>(`${env.API_BASE_URL}/v1/admin/rooms/${renterId}`)
      }



    //get report for income and expense
    getIncomeReport(zoneName: string): Observable<any>{

        const httpParams = new HttpParams()
                            .set('zoneName', zoneName) 
        return this._httpClient.get<any>(`${env.API_BASE_URL}/v1/utils/invoice/generate-income`, 
            {params: httpParams})
    }
    
    getExpenseReport(): Observable<any>{
        // const httpParams = new HttpParams()
        //                         .set('zoneName)
        return this._httpClient.get<any>(`${env.API_BASE_URL}/v1/utils/invoice/generate-expense`, )
    }
    
    
    //========================> dashboard Service v2
    getStatisticsv2(): Observable <DashboardStatisticsV2>{
        return this._httpClient.get<DashboardStatisticsV2>(`${env.API_BASE_URL}/v1/admin/dashboard/get-statistics/statistics`)
    }

    getDashboardRenter(params: { status: string; limit: 20 }): Observable<RenterDashboard[]> {
        const filteredParams: { [key: string]: any } = {};
        Object.keys(params || {}).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                filteredParams[key] = params[key];
            }
        });
    
        return this._httpClient.get<RenterDashboardInterface>(`${env.API_BASE_URL}/v1/admin/dashboard/renter-in-out`,
            { params: filteredParams }).pipe(
            map(response => response.data) // Extract only the 'data' field
        );
    }
    
    getZoneStatisticsv2(): Observable<ZoneStatisticsV2[]>{
        return this._httpClient.get<DashboardStatisticsV2>(
            `${env.API_BASE_URL}/v1/admin/dashboard/get-statistics/statistics`
        ).pipe(
            // tap(response => console.log("Full API Response:", response.data.object_2)), // Debug full response
            map(response => response.data?.object_2?.zones) // Prevent errors if undefined
        );
    }

    //-----> service to get info before get zone
    getZoneInfotoCreate(params : {zone_id : number}): Observable<InvoiceInfoInterface>{
        return this._httpClient.get<InvoiceInfoInterface>(
            `${env.API_BASE_URL}/v1/admin/dashboard/invoices-by-zone/${params.zone_id}`
        )
    }

    generateInvoiceByZone(params :  {zone_id: number}): Observable<any> {
        if (!params.zone_id) {
            console.error('Invalid zoneId:', params.zone_id); // Logging to check the invalid case
            return;
        }
        return this._httpClient.post<any>(`${env.API_BASE_URL}/v1/admin/dashboard/invoices-by-zone/${params.zone_id}`, {});
    }


}