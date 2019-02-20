import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';
import { switchMap } from 'rxjs/operators';

export const HEADER_IGNORE_INTERCEPTOR = 'IGNORE_INTERCEPTOR';

@Injectable()
export class KeycloakHttpInterceptor implements HttpInterceptor {

  constructor(private keycloakService: KeycloakService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!this.keycloakService.authenticated()) {
      return next.handle(req);
    }

    const urlsToIgnore: any[] = this.keycloakService.urlsToIgnore;
    if (urlsToIgnore && urlsToIgnore.length) {
      let hasMatch = urlsToIgnore.some((url) => req.url.search(url) > -1);
      if (hasMatch) {
        return next.handle(req);
      }
    }

    if (req.headers.has(HEADER_IGNORE_INTERCEPTOR)) {
      const newHeaders = req.headers.delete(HEADER_IGNORE_INTERCEPTOR);
      const newRequest = req.clone({ headers: newHeaders });
      return next.handle(newRequest);
    }

    return this.keycloakService.getToken()
      .pipe(switchMap(token => next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))));
  }

}
