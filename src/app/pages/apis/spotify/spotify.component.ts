// src\app\pages\spotify\spotify.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SpotifyService } from '../../../core/services/apis/spotify.service';
import { ArtistInfo, SpotifyTrack } from '../../../interfaces/apis/spotify.interface';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-spotify',
  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.scss']
})
export class SpotifyComponent implements OnInit, OnDestroy {
  artistInfo: ArtistInfo | null = null;
  topTracks: SpotifyTrack[] = [];
  isLoading = false;
  error: string | null = null;
  currentPlayingTrack: SpotifyTrack | null = null;
  selectedTrack: SpotifyTrack | null = null; // Añade esta nueva propiedad

  private subscriptions = new Subscription();

  constructor(private spotifyService: SpotifyService) {}

  ngOnInit(): void {
    this.loadTopTracks();
  }

  ngOnDestroy(): void {
    this.stopCurrentTrack();
    this.subscriptions.unsubscribe();
  }

  private loadTopTracks(): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.spotifyService.getTopTracks().pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (tracks) => this.topTracks = tracks,
        error: (error) => this.error = error
      })
    );
  }

  playTrack(track: SpotifyTrack): void {
    // Modificamos este método
    if (this.currentPlayingTrack?.id === track.id) {
      this.stopCurrentTrack();
      this.selectedTrack = null;
      return;
    }

    this.stopCurrentTrack();
    this.selectedTrack = track;
    this.currentPlayingTrack = track;
    track.isPlaying = true;
  }

  stopCurrentTrack(): void {
    if (this.currentPlayingTrack) {
      this.currentPlayingTrack.isPlaying = false;
      this.selectedTrack = null;
      this.currentPlayingTrack = null;
    }
  }

  onClosePlayer(): void {
    // Añade este nuevo método
    this.stopCurrentTrack();
  }

  addToPlaylist(track: SpotifyTrack): void {
    // Aquí deberías obtener el userId del servicio de autenticación
    const userId = 'user-id'; // Reemplazar con el ID real del usuario
    
    this.isLoading = true;
    this.subscriptions.add(
      this.spotifyService.addToPlaylist(userId, track.uri).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          // Aquí podrías mostrar un mensaje de éxito
          console.log('Canción agregada a la playlist');
        },
        error: (error) => this.error = error
      })
    );
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}