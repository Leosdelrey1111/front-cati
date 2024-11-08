import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../core/services/login.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { FacebookLoginProvider } from "@abacritt/angularx-social-login";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  userData: any = null;
  formLog!: FormGroup;

  constructor(
    private form: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.formLog = this.form.group({
      email_usr: ['', [Validators.required, Validators.email]],
      passwd_usr: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.formLog.valid) {
      const { email_usr, passwd_usr } = this.formLog.value;
      try {
        const response = await firstValueFrom(this.loginService.loginUsuario(email_usr, passwd_usr));
        
        // Verificar si se recibió un token
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
          const userRole = localStorage.getItem('userRole');
          this.formLog.reset();

          Swal.fire({
            title: "¡Hecho!",
            text: "Inicio de sesión exitoso",
            icon: "success"
          });

          localStorage.setItem('authToken', response.token);

          // Redirigir según el rol del usuario
          if (userRole === 'admin') {
            this.router.navigate(['/admin']);
          } else if (userRole === 'gestor') {
            this.router.navigate(['/gestor']);
          } else if (userRole === 'usuario') {
            this.router.navigate(['/inicio']);
          }
        } else {
          throw new Error('No se recibió un token válido');
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Contraseña o correo incorrectos",
          icon: "error"
        });
      }
    } else {
      Swal.fire({
        title: "Error!",
        text: "Formulario inválido. Revise los campos.",
        icon: "error"
      });
      this.formLog.markAllAsTouched();
    }
  }

  hasErrors(controlName: string, errorName: string): boolean {
    const control = this.formLog.get(controlName);
    return control ? control.hasError(errorName) && control.touched : false;
  }
}