// src\app\core\services\chatbot\snatchbot.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoginService } from '../login.service';

@Injectable({
  providedIn: 'root'
})
export class SnatchbotService {
  private botScriptId = 'snatchbot-script';
  private botInitialized = false;
  private botVisibility = new BehaviorSubject<boolean>(false);
  private authSubscription: Subscription | undefined;
  private routerSubscription: Subscription | undefined;

  private allowedRoutes = [
    '/',
    '/inicio',
    '/paquetes',
    '/paquetes-personalizados',
    '/login',
    '/registro',
    '/mis-paquetes'
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private loginService: LoginService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Observar cambios de ruta
      this.routerSubscription = this.router.events.pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updateBotVisibility();
      });

      // Suscribirse a cambios de autenticación
      this.authSubscription = this.loginService.getAuthStateChanges().subscribe((isAuthenticated) => {
        // Forzar una actualización asíncrona para asegurar que los cambios en localStorage se hayan aplicado
        Promise.resolve().then(() => {
          this.updateBotVisibility();
        });
      });

      // Verificar estado inicial
      this.updateBotVisibility();
    }
  }

  private updateBotVisibility() {
    const shouldShow = this.shouldShowBot();
    
    if (shouldShow && !this.botInitialized) {
      this.botVisibility.next(true);
    } else if (!shouldShow && this.botInitialized) {
      this.removeBot();
      this.botVisibility.next(false);
    } else {
      this.botVisibility.next(shouldShow);
    }
  }

  private shouldShowBot(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const currentUrl = this.router.url;
    const isAllowedRoute = this.allowedRoutes.some(route => 
      currentUrl === route || currentUrl.startsWith(route + '/')
    );

    const isAuthenticated = this.loginService.isLogged();
    const isUser = this.loginService.isUser();
    const isAdmin = this.loginService.isAdmin();
    const isGestor = this.loginService.isGestor();

    return isAllowedRoute && (!isAuthenticated || (!isAdmin && !isGestor && isUser));
  }

  initBot(botId: number) {
    if (!isPlatformBrowser(this.platformId) || this.botInitialized) return;

    try {
      // Limpiar cualquier instancia previa
      this.removeBot();

      const script = document.createElement('script');
      script.id = this.botScriptId;
      script.src = 'https://account.snatchbot.me/script.js';

      script.onload = () => {
        if (window['sntchChat' as keyof Window]) {
          (window['sntchChat' as keyof Window] as any).Init(botId);
          this.botInitialized = true;
        }
      };
      document.body.appendChild(script);
    } catch (error) {
    }
  }

  removeBot() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Remover script
      const script = document.getElementById(this.botScriptId);
      if (script) {
        script.remove();
      }
      // Remover contenedor del bot
      const botContainer = document.querySelector('.sntch-chat-container');
      if (botContainer) {
        botContainer.remove();
      }
      // Remover cualquier otro elemento relacionado con el bot
      const sntchElements = document.querySelectorAll('[id^="sntch"]');
      sntchElements.forEach(element => element.remove());

      // Limpiar cualquier instancia global
      if ((window as any)['sntchChat']) {
        (window as any)['sntchChat'] = undefined;
      }

      this.botInitialized = false;
    } catch (error) {
    }
  }

  getBotVisibility() {
    return this.botVisibility.asObservable();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.removeBot();
  }
}