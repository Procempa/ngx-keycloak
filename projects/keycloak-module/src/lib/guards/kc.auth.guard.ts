import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';

export interface GuardParams {
  isAuthenticated: boolean
  urlAttempted: string
  route: Route
}

export abstract class BaseKeycloakGuard {

  constructor(protected keycloakSrv: KeycloakService) { }

  /**
   * Verify the route
   * @param route
   * @param state
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isAuthenticated = this.keycloakSrv.authenticated();
    const urlAttempted = `${location.origin}${state.url}`;
    const params = { route: route.routeConfig, isAuthenticated, urlAttempted }
    return this.isAllowed(params);
  }

  /**
   *  Verify lazy loaded routes
   * @param route
   */
  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    const isAuthenticated = this.keycloakSrv.authenticated();
    const urlAttempted = `${location.origin}${route.path}`;
    const params = { route, isAuthenticated, urlAttempted }
    return this.isAllowed(params);
  }

  /**
   * Verify the child route
   * @param route
   * @param state
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }

  /**
   * Abstract method to be overloaded
   */
  protected abstract isAllowed(params: GuardParams): Observable<boolean> | Promise<boolean> | boolean;

}
