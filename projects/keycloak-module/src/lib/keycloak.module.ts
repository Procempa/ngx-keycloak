import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpInterceptor } from '@angular/common/http';
///
import { KeycloakRoleDirective } from './directives/keycloak-role.directive';
import { KeycloakService } from './services/keycloak.service';
import { KeycloakAuthGuard } from './guards/auth.guard';
import { KeycloakHttpInterceptor } from './interceptors/KeycloakHttpInterceptor';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    KeycloakRoleDirective
  ],
  exports: [
    KeycloakRoleDirective
  ]
})
export class KeycloakModule {

  static forRoot(provide?: { interceptor?: (keycloakService: KeycloakService) => HttpInterceptor }): ModuleWithProviders {

    return {
      ngModule: KeycloakModule,
      providers: [
        KeycloakService,
        KeycloakAuthGuard,
        { provide: HTTP_INTERCEPTORS, multi: true, useFactory: provide['interceptor'] || kcInterceptorFactory, deps: [KeycloakService] }
      ]
    };

  }
}

export function kcInterceptorFactory(ks: KeycloakService): HttpInterceptor {
  return new KeycloakHttpInterceptor(ks);
}
