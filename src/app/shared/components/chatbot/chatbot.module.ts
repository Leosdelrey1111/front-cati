// src/app/shared/components/chatbot/chatbot.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './chatbot.component';

@NgModule({
  declarations: [ChatbotComponent],
  imports: [CommonModule],
  exports: [ChatbotComponent]
})
export class ChatbotModule { }