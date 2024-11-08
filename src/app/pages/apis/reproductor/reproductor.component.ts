//scr/app/pages/reproductor/reproductor.component.ts
import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SpotifyTrack } from '../../../interfaces/apis/spotify.interface';

@Component({
  selector: 'app-reproductor',
  templateUrl: './reproductor.component.html',
  styleUrls: ['./reproductor.component.scss']
})
export class ReproductorComponent implements OnDestroy {
  @Input() track: SpotifyTrack | null = null;
  @Output() closePlayer = new EventEmitter<void>();
  
  audioElement?: HTMLAudioElement;
  currentTime: number = 0;
  duration: number = 0;
  isPlaying: boolean = false;
  volume: number = 1;

  ngOnInit(): void {
    if (this.track?.preview_url) {
      this.initializeAudio();
    }
  }

  ngOnDestroy(): void {
    this.destroyAudio();
  }

  private initializeAudio(): void {
    if (this.track?.preview_url) {
      this.audioElement = new Audio(this.track.preview_url);
      this.setupAudioEvents();
    }
  }

  private setupAudioEvents(): void {
    if (this.audioElement) {
      this.audioElement.addEventListener('timeupdate', () => {
        this.currentTime = this.audioElement?.currentTime || 0;
      });

      this.audioElement.addEventListener('loadedmetadata', () => {
        this.duration = this.audioElement?.duration || 0;
      });

      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
      });
    }
  }

  togglePlay(): void {
    if (this.audioElement) {
      if (this.isPlaying) {
        this.audioElement.pause();
      } else {
        this.audioElement.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }

  setVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume = Number(input.value);
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  setProgress(event: Event): void {
    const input = event.target as HTMLInputElement;
    const time = Number(input.value);
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  close(): void {
    this.destroyAudio();
    this.closePlayer.emit();
  }

  private destroyAudio(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = '';
      this.audioElement = undefined;
    }
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}