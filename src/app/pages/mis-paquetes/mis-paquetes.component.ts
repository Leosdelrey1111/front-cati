import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UsuariosService } from '../../core/services/usuarios.service';
import { GeolocationService, NearbyService } from '../../core/services/apis/geolocatizacion.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-mis-paquetes',
  templateUrl: './mis-paquetes.component.html',
  styleUrls: ['./mis-paquetes.component.scss']
})
export class MisPaquetesComponent implements OnInit {
  paquetes: any[] = [];
  cargando: boolean = true;
  error: string | null = null;
  
  latitude: number = 0;
  longitude: number = 0;
  locationError: string | undefined;
  mapUrl: SafeResourceUrl | undefined;
  filteredNearbyServices: any[] = [];
  
  nearbyServices: NearbyService[] = [];
  private map: any; 
  private L: any;
  private routingControl: any;
  isRouteDisplayed: boolean = false;

  constructor(
    private paqueteService: UsuariosService,
    private geolocationService: GeolocationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      this.loadLeaflet();
      if (token) {
        this.cargarPaquetes();
      } else {
        this.error = 'No hay token de autenticación';
      }
    }
  }

  private async loadLeaflet() {
    try {
      const L = await import('leaflet');
      this.L = L;
      this.fixLeafletMarkerIcons();
      this.initMap();
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  }

  private fixLeafletMarkerIcons() {
    const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/marker-icon.png';
    const shadowUrl = 'assets/leaflet/marker-shadow.png';
    
    const iconDefault = this.L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    this.L.Marker.prototype.options.icon = iconDefault;
  }

  private async loadLeafletAndPlugins(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const L = await import('leaflet');
        await import('leaflet-routing-machine');
        const LRM = (window as any).L.Routing;
        if (LRM && typeof LRM === 'object') {
          Object.assign(L, { Routing: LRM });
        }
        this.L = L;
      } catch (error) {
      }
    }
  }

  private async initMap(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        await this.loadLeafletAndPlugins();

        const mapElement = document.getElementById('map');
        if (mapElement) {
          this.map = this.L.map('map').setView([this.latitude, this.longitude], 13);

          this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);

          this.L.marker([this.latitude, this.longitude]).addTo(this.map)
            .bindPopup('Tu ubicación actual')
            .openPopup();

          await this.initRouting();
          this.getNearbyServicesForAllPackages();
        }
      } catch (error) {
      }
    }
  }

  private async initRouting(): Promise<void> {
    if (this.L && this.L.Routing) {
      try {
        this.routingControl = this.L.Routing.control({
          waypoints: [],
          routeWhileDragging: true,
          showAlternatives: true,
          fitSelectedRoutes: true,
          addWaypoints: false,
        });
        this.routingControl.addTo(this.map);
      } catch (error) {
      }
    } else {
      await this.loadLeafletAndPlugins();
      if (this.L && this.L.Routing) {
        await this.initRouting();
      }
    }
  }

  async showRoute(lat: number, lng: number): Promise<void> {
    if (!this.routingControl) {
      try {
        await this.initRouting();
      } catch (error) {
        return;
      }
    }
  
    if (this.routingControl && this.L) {
      try {
        this.setRouteWaypoints(lat, lng);
      } catch (error) {
        await this.initRouting();
        this.setRouteWaypoints(lat, lng);
      }
    }
  }

  private setRouteWaypoints(lat: number, lng: number): void {
    if (this.routingControl && this.L) {
      this.routingControl.setWaypoints([
        this.L.latLng(this.latitude, this.longitude),
        this.L.latLng(lat, lng)
      ]);
      this.isRouteDisplayed = true;
    }
  }

  clearRoute(): void {
    if (this.routingControl) {
      this.routingControl.setWaypoints([]);
      this.isRouteDisplayed = false;
    }
  }
  
  cargarPaquetes(): void {
    this.cargando = true;
    this.paqueteService.getMisPaquetes().subscribe(
      (data) => {
        this.paquetes = data;
        this.cargando = false;
        if (isPlatformBrowser(this.platformId)) {
          this.getUserLocation();
        }
      },
      (error) => {
        if (error.status === 403) {
          this.error = 'Error de autenticación. Por favor, inicie sesión nuevamente.';
        } else {
          this.error = `Error: ${error.status} - ${error.statusText}. Mensaje: ${error.error?.error || 'No disponible'}`;
        }
        this.cargando = false;
      }
    );
  }

  getUserLocation(): void {
    if (isPlatformBrowser(this.platformId) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.initMap();
          this.getNearbyServicesForAllPackages();
        },
        (error) => {
          this.locationError = 'Error al obtener la ubicación: ' + error.message;
        }
      );
    } else {
      this.locationError = 'La Geolocalización no está disponible.';
    }
  }

  updateMapWithServices(): void {
    if (!this.map || !this.L) {
      return;
    }

    this.map.eachLayer((layer: any) => {
      if (layer instanceof this.L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    const userIcon = this.L.divIcon({
      className: 'user-marker',
      html: '<div style="background-color: red; width: 15px; height: 15px; border-radius: 50%;"></div>',
      iconSize: [15, 15],
      iconAnchor: [7, 7]
    });

    this.L.marker([this.latitude, this.longitude], { icon: userIcon }).addTo(this.map)
      .bindPopup('Tu ubicación actual')
      .openPopup();
  
    this.filteredNearbyServices = this.nearbyServices.filter(service => 
      service.tipo_servicio !== 'Transportista' && 
      service.tipo_servicio !== 'Guía' &&
      service.nombre && service.nombre !== 'Servicio sin nombre'
    );

    this.filteredNearbyServices.forEach(service => {
      if (service.latitud && service.longitud) {
        const tipoServicio = service.tipo_servicio || service.tipo || 'No especificado';
        const marker = this.L.marker([service.latitud, service.longitud]).addTo(this.map);
        
        const popupContent = this.L.DomUtil.create('div');
        const strongElement = this.L.DomUtil.create('strong', '', popupContent);
        strongElement.textContent = service.nombre;
        popupContent.appendChild(this.L.DomUtil.create('br'));
        popupContent.appendChild(document.createTextNode(`Tipo: ${tipoServicio}`));
        popupContent.appendChild(this.L.DomUtil.create('br'));

        const routeButton = this.L.DomUtil.create('button', '', popupContent);
        routeButton.textContent = 'Mostrar ruta';
        routeButton.onclick = () => {
          this.showRoute(service.latitud, service.longitud).catch(error => {
          });
        };
        marker.bindPopup(popupContent);
      }
    });

    if (this.filteredNearbyServices.length > 0) {
      const group = new this.L.FeatureGroup([
        ...this.filteredNearbyServices
          .filter(service => service.latitud && service.longitud)
          .map(service => this.L.marker([service.latitud, service.longitud])),
        this.L.marker([this.latitude, this.longitude], { icon: userIcon })
      ]);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  getNearbyServicesForAllPackages(): void {
    if (!this.latitude || !this.longitude || this.paquetes.length === 0) {
      return;
    }

    const serviceObservables: Observable<NearbyService[]>[] = this.paquetes.map(paquete => 
      this.geolocationService.getNearbyServices(this.latitude, this.longitude, 5, paquete.id_paquete)
    );

    forkJoin(serviceObservables).pipe(
      map((results: NearbyService[][]) => results.flat())
    ).subscribe({
      next: (allServices: NearbyService[]) => {
        this.nearbyServices = allServices;
        this.updateMapWithServices();
      },
      error: (error: any) => {
        this.error = 'Error al obtener servicios cercanos';
        console.error('Error en getNearbyServicesForAllPackages:', error);
      }
    });
  }

  paqueteTieneActividades(paquete: any): boolean {
    return paquete.servicios?.some((servicio: any) => 
      servicio.actividades && servicio.actividades.length > 0
    ) ?? false;
  }
}