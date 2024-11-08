import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HosteleriaService } from '../../../core/services/hosteleria.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin-hosteleria',
  templateUrl: './admin-hosteleria.component.html',
  styleUrls: ['./admin-hosteleria.component.scss']
})
export class AdminHosteleriaComponent implements OnInit {
  hosteleriaForm: FormGroup;
  hosteleria: any[] = [];
  isEditing = false;
  editingHosteleriaId: number | null = null;

  // Pra usar la Api de Geolocalización
  map: any;
  latitude: number = 0;
  longitude: number = 0;
  mapUrl: SafeResourceUrl | undefined;
  private L: any;


  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private hosteleriaService: HosteleriaService,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.hosteleriaForm = this.fb.group({
      tipo_hs: [''],
      nom_hs: ['', Validators.required],
      descripcion_hs: [''],
      accesibility_infrastr_hs: [''],
      tipologia_hs: [''],
      costo_hs: [''],
      servicios: [''],
      img_hs: [''],
      latitud : [''],
      longitud : ['']
    });
  }

  ngOnInit(): void {
    this.loadHosteleria();
   
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }
  }

  loadHosteleria(): void {
    this.hosteleriaService.getAllHostelerias().subscribe((data) => {
      this.hosteleria = data;
    });
  }

  onSubmit(): void {
    
    if (this.isEditing) {
      this.updateHosteleria();
    } else {
      this.createHosteleria();
    }
  }

  createHosteleria(): void {
    if (this.hosteleriaForm.valid) {
      this.hosteleriaService.createHosteleria(this.hosteleriaForm.value).subscribe(() => {
        this.loadHosteleria();
        this.hosteleriaForm.reset();
      });
    }
    Swal.fire({
      title: "!Hecho!",
      text: "Registro exitoso.",
      icon: "success"
    });
  }

  editHosteleria(hosteleria: any): void {
    this.isEditing = true;
    this.editingHosteleriaId = hosteleria.id_hosteleria;
    this.hosteleriaForm.setValue({
      tipo_hs: hosteleria.tipo_hs,
      nom_hs: hosteleria.nom_hs,
      descripcion_hs: hosteleria.descripcion_hs,
      accesibility_infrastr_hs: hosteleria.accesibility_infrastr_hs,
      tipologia_hs: hosteleria.tipologia_hs,
      costo_hs: hosteleria.costo_hs,
      capacidad_hs: hosteleria.capacidad_hs,
      servicios: hosteleria.servicios,
      img_hs: hosteleria.img_hs,
      latitud: hosteleria.latitud,
      longitud: hosteleria.longitud
    });
  }

  updateHosteleria(): void {
    if (this.hosteleriaForm.valid && this.editingHosteleriaId !== null) {
      const updatedHosteleria = { ...this.hosteleriaForm.value, id_hosteleria: this.editingHosteleriaId };
      this.hosteleriaService.updateHosteleria(updatedHosteleria).subscribe(() => {
        this.loadHosteleria();
        this.hosteleriaForm.reset();
        this.isEditing = false;
        this.editingHosteleriaId = null;
      });
    }
  }

  deleteHosteleria(id_hosteleria: number): void {
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
        this.hosteleriaService.deleteHosteleria(id_hosteleria).subscribe(() => {
          this.loadHosteleria();
        });
      }
    });
  }

  //API de Geolocalización 

async initializeMap(): Promise<void> {
    if (typeof window !== 'undefined') {
      this.L = await import('leaflet');
      
      const mapElement = document.getElementById('map');
      if (mapElement) {
        this.map = this.L.map('map').setView([21.15522, -100.934], 15);

        this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
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

    
        this.hosteleriaForm.patchValue({
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
  
    this.hosteleriaForm.patchValue({
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
