import { SocialAuthService, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RegistroService } from '../../../core/services/auth.service';
import { Usuario } from '../../../interfaces/cruds/usuario.interface';
@Component({
  selector: 'app-facebook',
  templateUrl: './facebook.component.html',
  styleUrl: './facebook.component.scss'
})
export class FacebookComponent {
  title = 'Facebook';
  user: any;
  loggedIn: boolean = false; // Inicializa como false

  constructor(
    private authService: SocialAuthService,
    private http: HttpClient,
    private router: Router,
    private registroService: RegistroService) { }

    private calculateAge(birthdate: string): number {
      const birthDate = new Date(birthdate);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970); // Devuelve la edad
    }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(user => {
      const authToken = user.authToken;

      // Enviar el token de Facebook al backend para obtener un token personalizado
      this.http.post('http://localhost:8090/usuario/insertarFace', { authToken }).subscribe({
        next: (response: any) => {
          const customToken = response.token;
          const userRole = "usuario"; // Ajusta el rol según sea necesario

          localStorage.setItem('authToken', customToken);
          localStorage.setItem('userRole', userRole);

          // Crear un objeto usuario con los datos necesarios
          const nuevoUsuario: Usuario = {
            nom_usr: user.name, // Nombre del usuario
            app_usr: user.lastName, // Apellido del usuario
            passwd_usr: 'default_password', // Asigna o genera una contraseña adecuada
            nacionalidad_usr: 'default', // O cualquier nacionalidad que sea relevante
            sexo_usr: 'N/A', // Asume que 'user.gender' es parte de los datos que obtienes
            edad_usr: 100, // Supón que tienes la fecha de nacimiento
            email_usr: user.email,
            ciudad_usr: 'deault'
            // Agrega otros campos necesarios...
          };

          // Registrar al usuario en el backend
          this.registroService.registrarUsuariFacebook(nuevoUsuario).subscribe({
            next: (registroResponse) => {
              // Registro exitoso
              // console.log('Usuario registrado exitosamente:', registroResponse);

              // Actualiza la información del usuario en el componente
              this.user = user;
              this.loggedIn = true;

              // Redirige a la página de inicio después de iniciar sesión
              this.router.navigate(['/inicio']);
            },
            error: registroErr => {
              console.error('Error al registrar al usuario:', registroErr);
            }
          });
        },
        error: err => {
          console.error('Error al obtener el token personalizado:', err);
        }
      });
    }).catch(err => {
      console.error('Error durante la autenticación:', err);
    });
  }

  signOut(): void {
    this.authService.signOut().then(() => {
      // Limpia el local storage al cerrar sesión
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');

      this.user = null;
      this.loggedIn = false;
    });
  }
}
