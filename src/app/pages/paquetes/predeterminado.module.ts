import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredeterminadoComponent } from '../paquetes/predeterminado.component';
import { CustomTimePipe } from '../paquetes/time.pipe';


@NgModule({
  declarations: [
    PredeterminadoComponent,
    CustomTimePipe 
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PredeterminadoComponent
  ]
})
export class PredeterminadoModule { }
