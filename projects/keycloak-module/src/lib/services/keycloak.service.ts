import { Injectable } from '@angular/core';
import * as Keycloak from 'keycloak-js';
import { Observable, Subscriber } from 'rxjs';
import { map } from "rxjs/operators";
import { AuthUser } from "../models/authuser";

@Injectable()
export class KeycloakService {

  private _keycloakInstance: Keycloak;

  constructor() {
  }

  private _urlsToIgnore: any[];

  set urlsToIgnore(value: string[] | RegExp[]) {
    this._urlsToIgnore = value;
  }

  get urlsToIgnore(): string[] | RegExp[] {
    return this._urlsToIgnore;
  }

  init(environment: { [key: string]: any } | string = {}, options?: any) {

    return new Promise((resolve, reject) => {
      this._keycloakInstance = new Keycloak(environment);
      this._keycloakInstance.init(options)
        .success(authenticated => {
          resolve(authenticated);
        })
        .error(errorData => {
          console.error('KeycloakService - Error initializing Keycloak', errorData);
          reject(errorData);
        });
    });
  }

  authenticated(): boolean {
    return this._keycloakInstance.authenticated;
  }

  hasRole(roleName: string): boolean {
    return this._keycloakInstance.hasResourceRole(roleName);
  }

  login(options?: any) {
    this._keycloakInstance.login(options);
  }

  logout() {
    this._keycloakInstance.logout();
  }

  getToken() {
    return this.getRefreshedData().pipe(map(ki => ki.token));
  }

  getUser() {
    return new Observable((obs: Subscriber<AuthUser>) => {
      this._keycloakInstance
        .loadUserProfile()
        .success(profile => {
          obs.next({
            name: profile.firstName,
            email: profile.email,
            username: profile.username,
            surname: profile.lastName,
            fullName: `${profile.firstName} ${profile.lastName}`,
            attributes: profile['attributes'],
            enabled: profile.enabled
          });
          obs.complete();
        })
        .error(e => obs.error(e));
    });
  }

  getKeycloakInstance() {
    return this._keycloakInstance;
  }

  private getRefreshedData() {
    return new Observable((obs: Subscriber<Keycloak>) => {
      if (this._keycloakInstance && this._keycloakInstance.token) {
        this._keycloakInstance
          .updateToken(60)
          .success(refreshed => {
            obs.next(this._keycloakInstance);
            obs.complete();
          })
          .error((error) => {
            this._keycloakInstance.clearToken();
            obs.error(`KeycloakService - Unable to update access token ${error}`);
          });
      } else {
        obs.error('KeycloakService - Not yet authenticated');
      }
    });
  }

}
