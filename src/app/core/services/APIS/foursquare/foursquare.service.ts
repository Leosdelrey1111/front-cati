import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoursquareService {

  private apiUrl = 'http://localhost:8090/api/buscar-lugar'; 
  private apiKey = 'fsq3zsmuEF2kL8pvUzYa06wskpwll/v+kKhij0vB0vS4N54=';

  constructor(private http: HttpClient) { }

  obtenerLugares(ll:string,query: string,radius:string, limit:string): Observable<any> {
    // Puedes usar latitud y longitud específicas de la ubicación si es necesario
    const params = new HttpParams()
    .set('ll', ll)
    .set('query', query)
    .set('radius', radius)
    .set('limit', limit)
 

    const headers = {
      'Authorization': this.apiKey,
      'Accept': 'application/json'
    };

    return this.http.get<any>(this.apiUrl, { headers, params });
  }
}