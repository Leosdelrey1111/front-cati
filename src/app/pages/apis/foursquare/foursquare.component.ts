import { Component, OnInit } from '@angular/core';
import { FoursquareService } from '../../../core/services/APIS/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare',
  templateUrl: './foursquare.component.html',
  styleUrl: './foursquare.component.scss'
})
export class FoursquareComponent implements OnInit {
  places: any[] = []; // Array para almacenar los lugares encontrados

  constructor(private foursquareService: FoursquareService) { }  // Inyectamos el servicio

  ngOnInit(): void {
    this.fetchPlaces(); // Llamamos a la función para obtener los lugares al iniciar el componente
  }

  fetchPlaces() {
    this.foursquareService.obtenerLugares()
      .subscribe(
        response => {
          // Filtra solo los lugares en Dolores Hidalgo C.I.N.
          this.places = response.data.filter((place: any) => place.location?.locality === "Dolores Hidalgo Cuna de la Independencia Nacional");
        },
        error => {
          console.error('Error al obtener los lugares', error);
        }
      );
  }
  
  
}
