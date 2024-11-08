import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface NearbyService {
  id: number;
  nombre: string;
  tipo_servicio: string;
  latitud: number;
  longitud: number;
}

interface NearbyServicesRequest {
  latitude: number;
  longitude: number;
  radius: number;
  paqueteId: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private apiUrl = `${environment.baseUrl}/api/listings`; 

  constructor(private http: HttpClient) { }

  getNearbyServices(latitude: number, longitude: number, radius: number, paqueteId: number): Observable<NearbyService[]> {
    const payload: NearbyServicesRequest = {
      latitude,
      longitude,
      radius,
      paqueteId
    };
    return this.http.post<NearbyService[]>(`${this.apiUrl}/servicios-cercanos`, payload);
  }
}