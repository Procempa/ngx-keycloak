import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Route } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';
import { Observable } from 'rxjs';

@Injectable()
export class KeycloakAuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(private keycloakService: KeycloakService) { }

  /**
   * Verify the route
   * @param next
   * @param state
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url = `${location.origin}${state.url}`;
    return this.checkLogin(url, next.data);
  }

  /**
   * Verify the child route
   * @param next
   * @param state
   */
  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }

  /**
   *  Verify lazy loaded routes
   * @param route
   */
  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    const url = `${location.origin}/${route.path}`;
    return this.checkLogin(url, route.data);
  }

  private checkLogin(attemptedUrl: string, extras?: { roles?: string[] }): Observable<boolean> | Promise<boolean> | boolean {
    if (this.keycloakService.authenticated()) {
      if (extras && extras.roles) {
        let roles: string[];
        Array.isArray(extras.roles) ? roles = extras.roles : roles = [extras.roles];
        return roles.some(role => this.keycloakService.hasRole(role));
      }
      else {
        return true;
      }
    }
    else {
      this.keycloakService.login(attemptedUrl);
    }
  }
}
