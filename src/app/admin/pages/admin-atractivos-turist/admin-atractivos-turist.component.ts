import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AtractivosService } from '../../../core/services/atractivos.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin-atractivos-turist',
  templateUrl: './admin-atractivos-turist.component.html',
  styleUrl: './admin-atractivos-turist.component.scss'
})
export class AdminAtractivosTuristComponent implements OnInit {
  atraccionForm: FormGroup;
  atracciones: any[] = [];
  isEditing = false;

  editingAtraccionId: number | null = null;
  map: any;
  latitude: number=0;
  longitude: number=0;
  mapUrl: SafeResourceUrl | undefined;
  private L: any;
  //Busqueda
  searchQuery:string="";

  constructor(
    private fb: FormBuilder,
    private atractivosService: AtractivosService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.atraccionForm = this.fb.group({
      nom_actur: ['', Validators.required],
      tipo_actur: [''],
      accesbilidad_actur: [''],
      descripcion_actur: [''],
      nom_calle_actur: [''],
      num_calle_actur: [''],
      localidad_actur: [''],
      tipologia_actur: [''],
      num_visitantes_actur: [''],
      categoria_actur: [''],
      servicios_actur: [''],
      costo_actur: [''],
      latitud: [''],
      longitud: ['']
    });
  }

  ngOnInit(): void {
    this.loadAtracciones();
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then(L => {
        this.L = L;
        setTimeout(() => {
          this.initializeMap();
        }, 0);
      });
    }
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log("El mapa se ha ajustado correctamente.");
        }
      }, 0);
    }
  }


  loadAtracciones(): void {
    this.atractivosService.getAllAtractivos().subscribe((data) => {
      this.atracciones = data;
    });
  }

  onSubmit(): void {
    if (this.isEditing) {
      this.updateAtraccion();
    } else {
      this.createAtraccion();
    }
  }

  createAtraccion(): void {
    if (this.atraccionForm.valid) {
      this.atractivosService.createAtractivo(this.atraccionForm.value).subscribe(() => {
        this.loadAtracciones();
        this.atraccionForm.reset();
      });
      Swal.fire({
        title: "!Hecho!",
        text: "Registro exitoso.",
        icon: "success"
      });
    }
  }

  editAtraccion(atraccion: any): void {
    this.isEditing = true;
    this.editingAtraccionId = atraccion.id_atracTuris;
    this.atraccionForm.setValue({
      nom_actur: atraccion.nom_actur,
      tipo_actur: atraccion.tipo_actur,
      accesbilidad_actur: atraccion.accesbilidad_actur,
      descripcion_actur: atraccion.descripcion_actur,
      nom_calle_actur: atraccion.nom_calle_actur,
      num_calle_actur: atraccion.num_calle_actur,
      localidad_actur: atraccion.localidad_actur,
      tipologia_actur: atraccion.tipologia_actur,
      num_visitantes_actur: atraccion.num_visitantes_actur,
      categoria_actur: atraccion.categoria_actur,
      servicios_actur: atraccion.servicios_actur,
      costo_actur: atraccion.costo_actur,
      latitud: atraccion.latitud,
      longitud: atraccion.longitud
    });
  }

  updateAtraccion(): void {
    if (this.atraccionForm.valid && this.editingAtraccionId !== null) {
      const updatedAtraccion = { ...this.atraccionForm.value, id_atracTuris: this.editingAtraccionId };
      this.atractivosService.updateAtractivo(updatedAtraccion).subscribe(() => {
        this.loadAtracciones();
        this.atraccionForm.reset();
        this.isEditing = false;
        this.editingAtraccionId = null;
      });
    }
  }

  deleteAtraccion(id_atracTuris: number): void {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No serás capaz de revertir está acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, borrar!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "!Borrado!",
          text: "Tu registro ha sido borrado.",
          icon: "success"
        });
        this.atractivosService.deleteAtractivo(id_atracTuris).subscribe(() => {
          this.loadAtracciones();
        });
      }
    });
  }
   //API de Geolocalización 
   initializeMap(): void {
    if (isPlatformBrowser(this.platformId) && this.L) {
      if (this.map) {
        this.map.invalidateSize();
      } else {
        this.map = this.L.map('map', {
          center: [21.15522, -100.934],
          zoom: 15
        });

        this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        const customIcon = this.L.icon({
          iconUrl: 'assets/leaflet/marker-icon-2x.png',
          iconSize: [30, 40], 
          iconAnchor: [15, 40],  
          popupAnchor: [0, -40] 
        });

    
      const marker = this.L.marker([21.15522, -100.931], { 
        icon: customIcon,   
        draggable: true   
      }).addTo(this.map);


      marker.on('dragend', (event: any) => {
        const position = marker.getLatLng();
        this.latitude = position.lat;
        this.longitude = position.lng;
        console.log(`Latitud: ${this.latitude}, Longitud: ${this.longitude}`);

    
        this.atraccionForm.patchValue({
          latitud: this.latitude,
          longitud: this.longitude
        });

        this.updateMapUrl();  
      });

   
      this.map.on('click', (event: any) => {
        const latlng = event.latlng;
        marker.setLatLng(latlng);  
        this.onMapClick(latlng);   
      });
    }
  }
}

  onMapClick(latlng: { lat: number; lng: number }): void {
    this.latitude = latlng.lat;
    this.longitude = latlng.lng;
    console.log(`Latitud: ${this.latitude}, Longitud: ${this.longitude}`);

    this.atraccionForm.patchValue({
      latitud: this.latitude,
      longitud: this.longitude
    });

    this.updateMapUrl();
  }
  getCoordinatesMessage(): string {
    return `Latitud: ${this.latitude}, Longitud: ${this.longitude}`;
  }

  updateMapUrl(): void {
    if (this.latitude && this.longitude) {
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.openstreetmap.org/export/embed.html?bbox=${this.longitude - 0.01},${this.latitude - 0.01},${this.longitude + 0.01},${this.latitude + 0.01}&layer=mapnik`
      );
    }
  }
}

