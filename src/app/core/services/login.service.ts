//src\app\core\services\login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private baseUrl: string = environment.baseUrl;
  private agenciasUrl = `${environment.baseUrl}/usuario/agencias`;
  private hotelesUrl = `${environment.baseUrl}/usuario/hoteles`;
  private restaurantesURL = `${environment.baseUrl}/usuario/restaurantes`;
  private experienciasURL = `${environment.baseUrl}/usuario/experiencias`;

  // BehaviorSubject para el estado de autenticación
  private authState = new BehaviorSubject<boolean>(this.isLogged());

  constructor(private http: HttpClient) {
    // Inicializar el estado de autenticación
    this.authState.next(this.isLogged());
  }

  loginUsuario(email_usr: string, passwd_usr: string): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/usuario/login`, { email_usr, passwd_usr })
      .pipe(
        tap((response) => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            const decodedToken: any = jwtDecode(response.token);
            localStorage.setItem('userRole', decodedToken.role);
            localStorage.setItem('userEmail', email_usr);
            // Emitir el cambio de estado
            this.authState.next(true);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    // Emitir el cambio de estado
    this.authState.next(false);
  }

  getAuthStateChanges(): Observable<boolean> {
    return this.authState.asObservable();
  }

  isLogged(): boolean {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('authToken');
      return !!token;
    }
    return false;
  }

  isUser(): boolean {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('userRole') === 'usuario' && this.isLogged();
    }
    return false;
  }

  isAdmin(): boolean {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('userRole') === 'admin' && this.isLogged();
    }
    return false;
  }

  isGestor(): boolean {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('userRole') === 'gestor' && this.isLogged();
    }
    return false;
  }
  getAllAgencias(): Observable<any> {
    return this.http.get<any>(`${this.agenciasUrl}`);
  }

  getAllHoteles(): Observable<any> {
    return this.http.get<any>(`${this.hotelesUrl}`);
  }

  getAllRestaurantes(): Observable<any> {
    return this.http.get<any>(`${this.restaurantesURL}`);
  }

  getAllExperiencias(): Observable<any> {
    return this.http.get<any>(`${this.experienciasURL}`);
  }
  getUsuarioLogeado() {
    return {
      email: localStorage.getItem('userEmail')||"",
    };
  }
}
