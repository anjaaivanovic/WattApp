import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  constructor(private http: HttpClient) { }

    baseUrl='https://localhost:7029/api/Cards';

  //get all cards

  getAllCards(): Observable<Card[]>
  {
    return this.http.get<Card[]>(this.baseUrl);

  }
  addCard(card: Card): Observable<Card>{
    card.id='00000000-0000-0000-000000000000';
   return this.http.post<Card>(this.baseUrl,card)
  }
}
