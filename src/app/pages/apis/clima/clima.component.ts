import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { OpenWeatherService } from '../../../core/services/apis/open-wheather.service';
import { WeatherForecast } from '../../../interfaces/apis/weather.interface';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.component.html',
  styleUrl: './clima.component.scss',
  providers: [DecimalPipe],
})
export class ClimaComponent {
  private lat = 21.157037609;
  private lon = -100.9335989;
  forecast: WeatherForecast[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private weatherService: OpenWeatherService,
    private decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    this.obtenerClima();
  }

  obtenerClima() {
    this.loading = true;
    this.error = null;

    this.weatherService.getForecast(this.lat, this.lon).subscribe({
      next: (data) => {
        this.forecast = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener el pronóstico del clima';
        this.loading = false;
      },
    });
  }

  formatTemperature(temp: number): string {
    return this.decimalPipe.transform(temp, '1.0-0') || '';
  }

  isToday(dateStr: string): boolean {
    const today = new Date();
    const forecastDate = new Date(dateStr);
    return today.toDateString() === forecastDate.toDateString();
  }
}