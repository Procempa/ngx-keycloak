import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
///
import { KeycloakRoleDirective } from './directives/keycloak-role.directive';
import { KeycloakAuthGuard } from './guards/auth.guard';
import { KeycloakHttpInterceptor } from './interceptors/KeycloakHttpInterceptor';
import { KeycloakService } from './services/keycloak.service';

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
export class NgxKeycloakModule {

  /**
   * Module with services (Guard, Keycloak and Interceptor)
   * to inject in root module
   */
  static forRoot(): ModuleWithProviders {

    return {
      ngModule: NgxKeycloakModule,
      providers: [
        KeycloakService,
        KeycloakAuthGuard,
        { provide: HTTP_INTERCEPTORS, multi: true, useClass: KeycloakHttpInterceptor, deps: [KeycloakService] }
      ]
    };

  }
}
