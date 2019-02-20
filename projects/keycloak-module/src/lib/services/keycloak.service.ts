import { Injectable } from '@angular/core';
import * as Keycloak_ from 'keycloak-js';
export const Keycloak = Keycloak_;

import { Observable, Subscriber } from 'rxjs';
import { map } from "rxjs/operators";
import { User } from "../models/authuser";

interface InitEnvironment {
  url?: string;
  realm?: string;
  clientId?: string;
}


@Injectable()
export class KeycloakService {

  // static keycloakAuth: Keycloak.KeycloakInstance = undefined;
  private keycloakAuth: Keycloak.KeycloakInstance;

  constructor() {
  }

  init(environment: InitEnvironment | string = {}, options?: Keycloak.KeycloakInitOptions) {

    return new Promise((resolve, reject) => {
      this.keycloakAuth = Keycloak(environment);
      this.keycloakAuth.init(options)
        .success(authenticated => {
          resolve(authenticated);
        })
        .error(errorData => {
          console.error('KeycloakService - Error initializing Keycloak', errorData);
          reject(errorData);
        });
    });
  }

  // static init(environment?: { KEYCLOAK_URL: string, KEYCLOAK_REALM: string, KEYCLOAK_CLIENT: string }, options?: Keycloak.KeycloakInitOptions): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.keycloakAuth = Keycloak({ url: environment.KEYCLOAK_URL, realm: environment.KEYCLOAK_REALM, clientId: environment.KEYCLOAK_CLIENT });

  //     this.keycloakAuth.init(options)
  //       .success(() => {
  //         resolve();
  //       })
  //       .error((errorData: any) => {
  //         console.error('KeycloakService - Error initializing Keycloak', errorData);
  //         reject(errorData);
  //       });
  //   });
  // }

  authenticated(): boolean {
    return this.keycloakAuth.authenticated;
  }

  hasRole(roleName: string): boolean {
    return this.keycloakAuth.hasResourceRole(roleName);
  }

  login(options?: Keycloak.KeycloakLoginOptions) {
    this.keycloakAuth.login(options);
  }

  logout() {
    this.keycloakAuth.logout();
  }

  getToken() {
    return this.getRefreshedData().pipe(map(ki => ki.token));
  }

  getUser() {
    return new Observable((obs: Subscriber<User>) => {
      this.keycloakAuth
        .loadUserProfile()
        .success(profile => {
          obs.next({
            name: profile.firstName,
            email: profile.email,
            username: profile.username,
            surname: profile.lastName,
            fullName: `${profile.firstName} ${profile.lastName}`,
            attributes: profile['attributes']
          });
          obs.complete();
        })
        .error(e => obs.error(e));
    });
  }

  private getRefreshedData() {
    return new Observable((obs: Subscriber<Keycloak.KeycloakInstance>) => {
      if (this.keycloakAuth && this.keycloakAuth.token) {
        this.keycloakAuth
          .updateToken(5)
          .success(refreshed => {
            obs.next(this.keycloakAuth);
            obs.complete();
          })
          .error((error) => {
            this.keycloakAuth.clearToken();
            obs.error(`KeycloakService - Unable to update access token ${error}`);
          });
      } else {
        obs.error('KeycloakService - Not yet authenticated');
      }
    });
  }

}
