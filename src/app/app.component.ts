import { Component } from '@angular/core';
import { SnatchbotService } from './core/services/chatbot/snatchbot.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  showBot$ = this.snatchbotService.getBotVisibility();

  constructor(private snatchbotService: SnatchbotService) {}
}
