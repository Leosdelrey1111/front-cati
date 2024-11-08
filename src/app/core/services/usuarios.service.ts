import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, map, of, tap, throwError } from 'rxjs';

export interface Usuario {
  id_usr: number;
  nom_usr: string;
  app_usr: string;
  nacionalidad_usr: string;
  sexo_usr: string;
  edad_usr: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.baseUrl}/admin/usuario`;

  private apiUrlMarco = `${environment.baseUrl}/admin/usuario`;

  private apiUrlPaqueteUusario = `${environment.baseUrl}/usuario`;
  
  private API_Url = 'http://localhost:8090/usuario';

  constructor(private http: HttpClient) { }

   getTodosUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrlMarco}`);
  }

    getAllUsuarios(): Observable<Usuario[]> {
      return this.http.get<Usuario[]>(`${this.apiUrl}s`).pipe(
        catchError(error => {
          console.error('Error en getAllUsuarios:', error);
          return of([]);
        })
      );
    }

    getUsuarioById(id_usr: number): Observable<Usuario> {
      return this.http.get<Usuario>(`${this.apiUrl}/${id_usr}`);
    }

    buscarUsuarios(termino: string): Observable<Usuario[]> {
      return this.getAllUsuarios().pipe(
        map(usuarios => usuarios.filter(usuario =>
          usuario.nom_usr.toLowerCase().includes(termino.toLowerCase()) ||
          usuario.app_usr.toLowerCase().includes(termino.toLowerCase())
        ))
      );
    }

    getMisPaquetes(): Observable<any[]> {
      console.log('Llamando a getMisPaquetes');
      return this.http.get<any[]>(`${this.apiUrlPaqueteUusario}/mispaquetes`).pipe(
        tap(response => console.log('Respuesta de getMisPaquetes:', response)),
        catchError(error => {
          console.error('Error en getMisPaquetes:', error);
          if (error.status === 403) {
            console.error('Error de autenticación. Token posiblemente inválido o expirado.');
            // Aquí podrías implementar lógica para redirigir al login o refrescar el token
          }
          return throwError(error);
        })
      );
    }
    enviarTicket(email: string, ticketPdf: Uint8Array): Observable<any> {
      if (!email) {
       throw new Error('El correo electrónico no puede estar vacío');
     }
     if (!ticketPdf || ticketPdf.length === 0) {
       throw new Error('El PDF del ticket no puede estar vacío');
     }
   
       const formData = new FormData();
       const blob = new Blob([ticketPdf], { type: 'application/pdf' });
   
       
       if (!blob) {
         throw new Error('No se pudo crear el archivo PDF para enviar');
       }
   
       formData.append('email', email); 
       formData.append('ticket', blob, 'ticket.pdf'); 
   
       // Log para verificar los datos
     console.log("Form Data Email:", email);
     console.log("Form Data Ticket:", blob);
       
       return this.http.post(`${this.API_Url}/enviarcorreo`, formData);
     }
}
