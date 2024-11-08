import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { WeatherForecast, WeatherResponse } from '../../../interfaces/apis/weather.interface';

@Injectable({
  providedIn: 'root'
})
export class OpenWeatherService {
  private apiUrl = `${environment.baseUrl}/api/weather`;

  constructor(private http: HttpClient) { }

  getForecast(lat: number, lon: number): Observable<WeatherForecast[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString());

    return this.http.get<WeatherResponse>(`${this.apiUrl}/forecast`, { params })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener el pronóstico');
        }),
        catchError(error => {
          throw error;
        })
      );
  }
}