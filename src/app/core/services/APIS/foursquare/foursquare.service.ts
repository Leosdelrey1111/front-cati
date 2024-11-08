import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoursquareService {

  private apiUrl = 'http://localhost:8090/api/buscar-lugar'; // Cambia esto a la URL de tu backend

  constructor(private http: HttpClient) { }

  obtenerLugares(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
