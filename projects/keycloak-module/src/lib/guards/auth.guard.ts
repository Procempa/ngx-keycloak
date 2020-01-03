import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';
import { BaseKeycloakGuard } from './kc.auth.guard';
import { GuardParams } from "../models/GuardParams";

@Injectable()
export class KeycloakAuthGuard extends BaseKeycloakGuard {

  constructor(private keycloakService: KeycloakService) {
    super(keycloakService);
  }

  protected isAllowed(params: GuardParams): Observable<boolean> | Promise<boolean> | boolean {
    if (params.isAuthenticated) {
      const roles = params.route.data && params.route.data.roles;
      if (roles) {
        return roles.some(role => this.keycloakService.hasRole(role));
      } else {
        return true;
      }
    } else {
      this.keycloakService.login(params.urlAttempted);
    }
  }
}
