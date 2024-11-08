// src/app/core/services/apis/spotify.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { SpotifyTrack, SpotifyResponse } from '../../../interfaces/apis/spotify.interface';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private apiUrl = `${environment.baseUrl}/api/spotify`;
  private audioElement?: HTMLAudioElement;

  constructor(private http: HttpClient) {}

  getTopTracks(): Observable<SpotifyTrack[]> {
    return this.http.get<SpotifyResponse<SpotifyTrack[]>>(`${this.apiUrl}/tracks`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  addToPlaylist(userId: string, trackUri: string): Observable<any> {
    return this.http.post<SpotifyResponse<any>>(`${this.apiUrl}/playlist/add`, {
      userId,
      trackUri
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Métodos para manejo de reproducción
  playPreview(track: SpotifyTrack): void {
    if (track.preview_url) {
      // Si hay una instancia previa de audio, la detenemos
      this.stopPreview();
      
      // Creamos una nueva instancia de audio
      this.audioElement = new Audio(track.preview_url);
      this.audioElement.volume = 0.5; // Volumen inicial
      this.audioElement.play();
    }
  }
  
  stopPreview(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement   = undefined;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.error || 'Error del servidor';
    }

    return throwError(() => errorMessage);
  }
}