import { Component, Renderer2, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../core/services/login.service';
import { ServicioGenericoCRUD } from '../../core/services/cruds/crud-servicio.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { UsuariosService } from '../../core/services/usuarios.service';
import { EmailValidator } from '@angular/forms';

interface Actividad {
  id_actividad: number;
  fecha_actividad: string;
  hora_actividad: string;
  descripcion_actividad: string;
}

interface Servicio {
  id_servicio: number;
  tipo_servicio: string;
  actividades: Actividad[];
}

interface Paquete {
  id_paquete: number;
  nom_paquete: string;
  tipo_paquete: string;
  costo_paquete: number;
  img_paquete: string;
  servicios: Servicio[];
}

interface AgenciaPaquetes {
  id_agencia: number;
  nom_ag: string;
  paquetes: Paquete[];
}

declare var paypal: any;

@Component({
  selector: 'app-predeterminado',
  templateUrl: './predeterminado.component.html',
  styleUrls: ['./predeterminado.component.scss']
})
export class PredeterminadoComponent implements OnInit {

  paquetesPorAgencia: { id_agencia: number; nom_ag: string; paquetes: Paquete[] }[] = [];
  showPayPalButton: { [key: string]: boolean } = {};
  isButtonClicked: { [key: string]: boolean } = {};
  openPaqueteKey: string | null = null;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private http: HttpClient,
    private genericService: ServicioGenericoCRUD,
    private usuariosService: UsuariosService,
  ) {}

  ngOnInit() {
    this.cargarPaquetes();
    this.loadPayPalScript();  // No pasa argumentos aquí
  }

  cargarPaquetes() {
    this.genericService.getPaquetesCompletosByAgencia().subscribe(
      (data: AgenciaPaquetes[]) => {
        this.paquetesPorAgencia = data;
        this.paquetesPorAgencia.forEach(agencia => {
          agencia.paquetes.forEach(paquete => {
            const key = `${agencia.id_agencia}_${paquete.id_paquete}`;
            this.showPayPalButton[key] = false;
            this.isButtonClicked[key] = false;
          });
        });
      },
      error => {
        console.error('Error al obtener paquetes por agencia:', error);
      }
    );
  }

  isPaqueteOpen(agenciaId: number, paqueteId: number): boolean {
    return this.openPaqueteKey === `${agenciaId}_${paqueteId}`;
  }

  obtenerPaquete(agenciaId: number, paqueteId: number) {
    const key = `${agenciaId}_${paqueteId}`;

    if (this.isButtonClicked[key] && this.isPaqueteOpen(agenciaId, paqueteId)) {
      return;
    }

    this.isButtonClicked[key] = true;

    if (this.loginService.isLogged()) {
      this.showPayPalButton[key] = true;
      this.openPaqueteKey = key;
      setTimeout(() => this.renderPayPalButton(key), 0);
    } else {
      Swal.fire({
        title: "Inicia sesión",
        text: "¡Necesitas iniciar sesión!",
        icon: "info"
      }).then(() => {
        this.router.navigate(['/login']);
      });
      this.isButtonClicked[key] = false;
    }
  }


  togglePaquete(agenciaId: number, paqueteId: number) {
    const key = `${agenciaId}_${paqueteId}`;

    if (this.isPaqueteOpen(agenciaId, paqueteId)) {
      this.openPaqueteKey = null;
    } else {
      this.openPaqueteKey = key;
      if (this.showPayPalButton[key]) {
        setTimeout(() => this.renderPayPalButton(key), 0);
      }
    }
  }

  loadPayPalScript(): void {
    this.http.get<{ clientId: string }>(`${environment.baseUrl}/api/paypal-client-id`).subscribe(
      response => {
        if (response.clientId) {
          const script = this.renderer.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${response.clientId}&currency=MXN`;

          script.onload = () => {
            console.log('PayPal SDK loaded successfully');
          };

          script.onerror = (error: Event | string) => {
            console.error('Error loading PayPal SDK:', error);
          };

          this.renderer.appendChild(this.elementRef.nativeElement, script);
        } else {
          console.error('Client ID is missing in the response');
        }
      },
      error => {
        console.error('Error fetching PayPal client ID:', error);
      }
    );
  }

  renderPayPalButton(key: string): void {
    const containerId = `paypal-button-container-${key}`;
    const container = document.getElementById(containerId);

    if (container) {
      container.innerHTML = '';
      console.log('Rendering PayPal button in:', containerId);

      const [agenciaId, paqueteId] = key.split('_').map(Number);
      const paquete = this.paquetesPorAgencia
        .find(a => a.id_agencia === agenciaId)?.paquetes
        .find(p => p.id_paquete === paqueteId);

      if (!paquete) {
        console.error('Paquete no encontrado');
        return;
      }

      const costo = parseFloat(paquete.costo_paquete.toString());
      if (isNaN(costo)) {
        console.error('El costo del paquete no es un número válido:', paquete.costo_paquete);
        return;
      }

      

      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'MXN',
                value: costo.toFixed(2)
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
              // Captura la transacción
              return actions.order.capture().then(async(details: any) => {
              const amount = details.purchase_units[0].amount;
  
              // Muestra el mensaje de confirmación
              Swal.fire({
                  title: "¡Gracias por su compra!",
                  text: `Transacción completada por ${details.payer.name.given_name}. Total pagado: ${amount.value} ${amount.currency_code}`,
                  width: 600,
                  padding: "3em",
                  color: "#716add",
                  background: "#fff url(../../../../../../assets/trees.png)",
                  backdrop: `
                      rgba(0,0,123,0.4)
                      url("../../../../assets/nyan-cat.gif")
                      left top
                      no-repeat
                  `
              });

              const usuarioLogeado = this.loginService.getUsuarioLogeado();
              // Verificar el correo electrónico del usuario
              console.log('Correo electrónico del usuario:', usuarioLogeado.email);  const usuario = this.loginService.getUsuarioLogeado();
              const email = usuario.email;
            
              if (!email) {
                console.error('No se pudo obtener el correo electrónico del usuario.');
                return;
              }


              // Genera el PDF del ticket (implementa tu función de generación aquí)
              const ticketPdf = await this.generarTicketPdf(details);
              console.log('PDF del ticket generado:', ticketPdf); // Verifica la generación del PDF
              
              await this.usuariosService.enviarTicket(email, ticketPdf).toPromise();

              console.log('Correo enviado con éxito');
            });
          
        
          } catch (error) {
              console.error('Error al capturar el pago o enviar el correo:', error);
                console.error('Error en el proceso de pago:', error);
                Swal.fire({
                    title: "Error!",
                    text: "Ha ocurrido un error en el proceso de pago. Por favor, inténtelo de nuevo.",
                    icon: "error"
                });
                this.isButtonClicked[key] = false;
}
      },
    
  }).render(`#${containerId}`);
    }

    
  }
  async generarTicketPdf(details: any): Promise<Uint8Array> {
      const pdfDoc = new jsPDF();

   // Verificaciones de datos para evitar errores si alguna propiedad no existe
   const nombre = details.payer?.name?.given_name || 'Nombre no disponible';
   const apellido = details.payer?.name?.surname || 'Apellido no disponible';
   

   const correo = details.payer?.email_address || this.loginService.getUsuarioLogeado().email;
   const paquete = details.purchase_units?.[0]?.description || 'Descripción no disponible';
   const total = details.purchase_units?.[0]?.amount?.value || '0.00';
   const moneda = details.purchase_units?.[0]?.amount?.currency_code || 'MX';    
  
      // Título del ticket
  pdfDoc.setFontSize(16);
  pdfDoc.text('Ticket de Compra', 70, 20); // Centrado

  // Fecha de compra
  const fechaActual = new Date();
  const fechaCompra = `${fechaActual.getDate()}/${fechaActual.getMonth() + 1}/${fechaActual.getFullYear()}`;
  pdfDoc.setFontSize(10);
  pdfDoc.text(`Fecha de compra: ${fechaCompra}`, 10, 40);

  // Datos del comprador
  pdfDoc.setFontSize(12);
  pdfDoc.text(`Nombre: ${nombre} ${apellido}`, 10, 50);
  pdfDoc.text(`Correo: ${correo}`, 10, 60);

  // Detalles del pedido
  pdfDoc.setFontSize(12);
  pdfDoc.text('Detalles del Pedido:', 10, 75);
  pdfDoc.text(`Paquete: ${paquete}`, 10, 85);
  pdfDoc.text(`Total: ${total} ${moneda}`, 10, 95);
  pdfDoc.text(`Método de pago: PayPal`, 10, 105);

  // Pie de página
  pdfDoc.setFontSize(10);
  pdfDoc.text('Gracias por tu compra.', 10, 130);
  pdfDoc.text('Visita nuestra web para más ofertas.', 10, 140);

 
  pdfDoc.setDrawColor(0);
  pdfDoc.line(10, 120, 200, 120); // Línea horizontal

  // Generar el PDF en formato binario
  const pdfData = pdfDoc.output('arraybuffer');

  // Convertir ArrayBuffer a Uint8Array para enviar
  return new Uint8Array(pdfData);
}

}
