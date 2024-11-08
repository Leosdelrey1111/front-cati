import { Component } from '@angular/core';

@Component({
  selector: 'app-layout-page-gestor',
  templateUrl: './layout-page.component.html',
  styleUrl: './layout-page.component.scss'
})
export class LayoutPageComponent {

  public sidebarItems=[
    {label:'Agencias',icon: 'source_environment', url: './agencias-CRUD'},
    {label: 'Administradores', icon: 'manage_accounts', url: './administradores-CRUD'},

    {label: 'Inicio', icon: 'door_front', url:'/inicio'}
  ]

}
