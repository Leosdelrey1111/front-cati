import { Component, OnInit } from '@angular/core';
import { FoursquareService } from '../../../core/services/APIS/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare',
  templateUrl: './foursquare.component.html',
  styleUrl: './foursquare.component.scss'
})
export class FoursquareComponent implements OnInit {
  places: any[] = []; // Array para almacenar los lugares encontrados
  ll: string= '21.1561,-100.9319';
  query: string = '';
  radius: string = '5000';
  limit: string = '50'; 



  constructor(private foursquareService: FoursquareService) { }  // Inyectamos el servicio

  ngOnInit(): void {
    this.fetchPlaces(); // Llamamos a la función para obtener los lugares al iniciar el componente
  }

  fetchPlaces() {
    this.foursquareService.obtenerLugares(this.ll, this.query,this.radius,this.limit)
      .subscribe(
        response => {
          this.places = response.data;
        },
        error => {
          console.error('Error al obtener los lugares', error);
        }
      );
  }
  
}