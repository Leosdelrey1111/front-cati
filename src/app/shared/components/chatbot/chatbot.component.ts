// src\app\shared\components\chatbot\chatbot.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SnatchbotService } from '../../../core/services/chatbot/snatchbot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  template: `
    <div *ngIf="showBot" id="sntch-container" class="chatbot-container"></div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
  `]
})
export class ChatbotComponent implements OnInit, OnDestroy {
  private botId = 400085;
  private subscription: Subscription | undefined;
  showBot = false;

  constructor(private snatchbotService: SnatchbotService) {}

  ngOnInit() {
    this.subscription = this.snatchbotService.getBotVisibility().subscribe(
      visible => {
        this.showBot = visible;
        if (visible) {
          // Usar Promise.resolve() para asegurar que el DOM se ha actualizado
          Promise.resolve().then(() => {
            this.snatchbotService.initBot(this.botId);
          });
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.snatchbotService.removeBot();
  }
}