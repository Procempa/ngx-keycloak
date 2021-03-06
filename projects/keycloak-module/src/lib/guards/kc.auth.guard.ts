import { ActivatedRouteSnapshot, Route, RouterStateSnapshot, CanActivate, CanLoad, CanActivateChild, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';
import { GuardParams } from '../models/GuardParams';

export abstract class BaseKeycloakGuard implements CanActivate, CanLoad, CanActivateChild {

  constructor(protected keycloakSrv: KeycloakService) { }

  /**
   * Verify the route
   * @param route
   * @param state
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean | UrlTree {
    const isAuthenticated = this.keycloakSrv.authenticated();
    const urlAttempted = `${location.origin}/${state.url}`;
    const params = { route: route.routeConfig, isAuthenticated, urlAttempted }
    return this.isAllowed(params);
  }

  /**
   *  Verify lazy loaded routes
   * @param route
   */
  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    const isAuthenticated = this.keycloakSrv.authenticated();
    const urlAttempted = `${location.origin}/${route.path}`;
    const params = { route, isAuthenticated, urlAttempted }

    const allowed = this.isAllowed(params);
    if (allowed instanceof UrlTree) {
      console.warn(`CanLoad is not allowed to return a UrlTree`);
      return false;
    }
    return allowed ? true : false;
  }

  /**
   * Verify the child route
   * @param route
   * @param state
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean | UrlTree {
    const isAuthenticated = this.keycloakSrv.authenticated();
    const urlAttempted = `${location.origin}/${state.url}`;
    const params = { route: route.routeConfig, isAuthenticated, urlAttempted }
    return this.isAllowed(params);
  }

  /**
   * Abstract method to be overloaded
   */
  protected abstract isAllowed(params: GuardParams): Observable<boolean> | Promise<boolean> | boolean | UrlTree;

}
