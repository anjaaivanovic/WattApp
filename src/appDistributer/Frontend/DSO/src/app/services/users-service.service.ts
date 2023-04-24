import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prosumer } from '../models/userstable';
import { lastValueFrom } from 'rxjs';
import { Neighborhood } from '../models/neighborhood';
import { enviroment } from 'src/enviroments/enviroment';
@Injectable({
  providedIn: 'root',
})
export class UsersServiceService {
  consumtion!: string;
  production!: string;
  prosumers!: Prosumer[];

  constructor(private http: HttpClient) {}

  private baseUrl = enviroment.apiUrl;

  refreshList() {
    lastValueFrom(
      this.http.get(this.baseUrl + 'Prosumer/GetAllProsumers')
    ).then((res) => (this.prosumers = res as Prosumer[]));
  }
  getUsers(): Observable<any[]> {
    return this.http.get<any>(this.baseUrl + 'Prosumer/GetAllProsumers');
  }
  detailsEmployee(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}Prosumer/getProsumerByID` + `?id=` + id
    );
  }
  Page(page: number, pagesize: number) {
    return this.http.get(
      `${this.baseUrl}Prosumer/GetProsumersPaging?PageNumber=` +
        page +
        `&PageSize=` +
        pagesize
    );
  }

  getAllNeighborhoods(): Observable<Neighborhood[]> {
    return this.http.get<Neighborhood[]>(
      this.baseUrl + 'GenericData/GetAllNeighborhoods'
    );
  }
  GetProsumersByNeighborhoodId(id: string): Observable<Prosumer[]> {
    return this.http.get<Prosumer[]>(
      this.baseUrl + 'Prosumer/GetProsumersByNeighborhoodId?id=' + id
    );
  }

  getAllProsumers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'Prosumer/GetAllProsumers');
  }

  // updateUserData(data: any) {
  //   return this.http.put(`${this.baseUrl3}`, data);
  updateUserData(id: any, data: any) {
    return this.http.put(
      `${this.baseUrl}` + `Dso/UpdateProsumerByDso?id=` + id,
      data
    );
  }

  deleteUser(id: any) {
    return this.http.delete(
      `${this.baseUrl}Prosumer/DeleteProsumer` + `?id=` + id
    );
  }

  prosumerFilter(
    minCon: number,
    maxCon: number,
    minProd: number,
    maxProd: number,
    minDev: number,
    maxDev: number
  ): Observable<Prosumer[]> {
    return this.http.get<Prosumer[]>(
      this.baseUrl +
        'Devices/UpdatedProsumerFilter?minConsumption=' +
        minCon +
        '&maxConsumption=' +
        maxCon +
        '&minProduction=' +
        minProd +
        '&maxProduction=' +
        maxProd +
        '&minDeviceCount=' +
        minDev +
        '&maxDeviceCount=' +
        maxDev
    );
  }
  prosumerFilter2(
    idNaselja: string,
    minCon: number,
    maxCon: number,
    minProd: number,
    maxProd: number,
    minDev: number,
    maxDev: number
  ): Observable<Prosumer[]> {
    return this.http.get<Prosumer[]>(
      this.baseUrl +
        'Devices/UpdatedProsumerFilter2?neighborhood=' +
        idNaselja +
        '&minConsumption=' +
        minCon +
        '&maxConsumption=' +
        maxCon +
        '&minProduction=' +
        minProd +
        '&maxProduction=' +
        maxProd +
        '&minDeviceCount=' +
        minDev +
        '&maxDeviceCount=' +
        maxDev
    );
  }
  ThisMonthsConsumptionAndProductionForProsumer(id: string): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        'TotalPowerUsage/ThisMonthTotalConsumptionProductionForProsumer?prosumerId=' +
        id
    );
  }
}
