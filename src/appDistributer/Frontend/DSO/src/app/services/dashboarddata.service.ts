import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { enviroment } from 'src/enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class DashboarddataService {
  constructor(private http: HttpClient) {}
  private dashboardBaseUrl = enviroment.apiUrl;
  Top5Consumers(): Observable<any[]> {
    return this.http.get<any[]>(
      this.dashboardBaseUrl + 'DashboardData/Top5Consumers'
    );
  }

  Top5Producers(): Observable<any[]> {
    return this.http.get<any[]>(
      this.dashboardBaseUrl + 'DashboardData/Top5Producers'
    );
  }

  ConsumerProducerRatio(): Observable<any[]> {
    return this.http.get<any[]>(
      this.dashboardBaseUrl + 'DashboardData/ConsumerProducerRatio'
    );
  }
  CityPercentages(): Observable<any[]> {
    return this.http.get<any[]>(
      this.dashboardBaseUrl + 'DashboardData/CityPercentages'
    );
  }

  ElectricityPrice(): Observable<any[]> {
    return this.http.get<any[]>(
      this.dashboardBaseUrl + 'DashboardData/CurrentPrice'
    );
  }
  getProsumerCout(): Observable<any> {
    return this.http.get<any>(
      this.dashboardBaseUrl + 'DashboardData/ProsumerCount'
    );
  }

  TotalProd(): Observable<any> {
    return this.http.get(
      this.dashboardBaseUrl + 'TotalPowerUsage/ThisWeekTotalProduction'
    );
  }

  TotalCons(): Observable<any> {
    return this.http.get(
      this.dashboardBaseUrl + 'TotalPowerUsage/ThisWeekTotalConsumption'
    );
  }

  nextWeekTotal(): Observable<any> {
    return this.http.get(
      this.dashboardBaseUrl +
        'TotalPowerUsage/NextWeekTotalPredictedConsumptionProduction'
    );
  }
}
