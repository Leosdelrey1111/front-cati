// src/app/interfaces/spotify.interface.ts
export interface SpotifyResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ArtistInfo {
  name: string;
  images: SpotifyImage[];
  followers: number;
  popularity: number;
  genres: string[];
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  external_url: string;
  image: string;
  popularity: number;
  uri: string;
  isPlaying?: boolean;
}