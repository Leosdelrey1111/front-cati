// src/app/interfaces/weather.interface.ts
export interface WeatherForecast {
    dt: number;
    date: string;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
  }
  
  export interface WeatherResponse {
    success: boolean;
    data: WeatherForecast[];
    message?: string;
  }