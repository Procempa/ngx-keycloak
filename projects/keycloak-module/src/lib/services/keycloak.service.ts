import { Injectable } from '@angular/core';
import * as Keycloak from 'keycloak-js';
import { Observable, Subject, Subscriber } from 'rxjs';
import { map, tap } from "rxjs/operators";
import { AuthUser } from "../models/authuser";
import { NgxKeycloakEvents } from '../models/NgxKeycloakEvents';

@Injectable({ providedIn: 'root' })
export class KeycloakService {

  constructor() { }

  /** the keycloak instance */
  private _keycloakInstance: Keycloak.KeycloakInstance;
  private _urlsToIgnore: any[];

  /** minimum token validity in seconds to test */
  minValidity = 5;
  /**
   * Emits the new token on refresh success
   */
  onAuthRefresh = new Subject<string>();
  /**
   * Emits on refresh error
   */
  onAuthRefreshError = new Subject<string>();
  /**
   * Emits when token has expired with the expiration date
   */
  onTokenExpired = new Subject<Date>();
  /**
   * Emits when the adapter is initialized and true if the user is authenticated
   */
  onReady = new Subject<boolean>();
  /**
   * Emits when the user is successfully authenticated with the user profile
   */
  onAuthSuccess = new Subject<AuthUser>();
  /**
   * Emits when there was an error during authentication with the possible reason if any
   */
  onAuthError = new Subject<string>();

  /** Urls to not send the token on the interceptor */
  set urlsToIgnore(value: string[] | RegExp[]) {
    this._urlsToIgnore = value;
  }

  get urlsToIgnore(): string[] | RegExp[] {
    return this._urlsToIgnore;
  }

  /**
   * initialize the keycloak adapter
   * @param environment path to JSON config file or object with keycloak configuration
   * @param options Keycloak Init options object
   */
  init(environment: { [key: string]: any } | string = {}, options?: Keycloak.KeycloakInitOptions) {

    return new Promise((resolve, reject) => {
      const fnKeycloak = Keycloak;
      this._keycloakInstance = fnKeycloak(environment);

      this.bindEvents();

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

  /**
   * Returns true if the token has less than `minValidity` seconds left before
	 * it expires.
   * @param minValidity seconds to test
   */
  isExpired(minValidity?: number) {
    const time = minValidity;
    return this._keycloakInstance.isTokenExpired(time);
  }

  /** true if the user is authenticated */
  authenticated(): boolean {
    return this._keycloakInstance.authenticated;
  }

  /**
   * test if the current user has the role for the resource
   *
   * @param roleName role
   * @param resource If not specified, `clientId` is used.
   * */
  hasRole(roleName: string, resource?: string): boolean {
    return this._keycloakInstance.hasResourceRole(roleName, resource);
  }

  /**
   * Redirects to login form
   * @param options a URI string to redirect after login or Keycloak login options object
   */
  login(options?: Keycloak.KeycloakLoginOptions | string) {
    if (options && typeof options === 'string') {
      options = { redirectUri: options };
    }
    //@ts-ignore
    this._keycloakInstance.login(options);
  }

  /**
   * logout the user
   * @param redirectUri uri to redirect after logout
   */
  logout(redirectUri?: string) {
    const opts = redirectUri ? { redirectUri } : undefined;
    this._keycloakInstance.logout(opts);
  }

  /**
   * get the current refreshed access token
   */
  getToken() {
    return this.getRefreshedData().pipe(map(ki => ki.token));
  }

  /**
   * get the user profile
   */
  getUser() {
    return new Observable((obs: Subscriber<AuthUser>) => {
      const roles = this._keycloakInstance.resourceAccess;
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
            roles
          });
          obs.complete();
        })
        .error(e => obs.error(e));
    });
  }

  /**
   * get this token expiration date
   */
  getExpirationDate() {
    const expiresIn = (this._keycloakInstance.tokenParsed['exp'] + this._keycloakInstance.timeSkew) * 1000;
    return new Date(expiresIn);
  }

  /**
   * get the full Keycloak instance
   */
  getKeycloakInstance() {
    return this._keycloakInstance;
  }

  private getRefreshedData() {
    return new Observable((obs: Subscriber<Keycloak.KeycloakInstance>) => {
      if (this._keycloakInstance && this._keycloakInstance.token) {
        this._keycloakInstance
          .updateToken(this.minValidity)
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

  /**
   * Bind functions to keycloak events
   * @param callbacks binds for keycloak events
   */
  bindEvents(callbacks?: NgxKeycloakEvents) {
    if (!this._keycloakInstance) return;

    const {
      onAuthRefreshSuccess = () => this.onAuthRefresh.next(this._keycloakInstance.token),
      onAuthRefreshError = () => this.onAuthRefreshError.next('An error has occurred while trying to refresh token'),
      onTokenExpired = () => {
        const expiresIn = (this._keycloakInstance.tokenParsed['exp'] + this._keycloakInstance.timeSkew) * 1000;
        this.onTokenExpired.next(new Date(expiresIn));
      },
      onReady = (auth) => this.onReady.next(auth),
      onAuthSuccess = () => this.getUser().pipe(tap(user => this.onAuthSuccess.next(user))),
      onAuthError = e => this.onAuthError.next(JSON.stringify(e))
    } = callbacks || {};

    this._keycloakInstance.onAuthRefreshSuccess = onAuthRefreshSuccess;
    this._keycloakInstance.onAuthRefreshError = onAuthRefreshError;
    this._keycloakInstance.onTokenExpired = onTokenExpired;
    this._keycloakInstance.onReady = onReady;
    this._keycloakInstance.onAuthSuccess = onAuthSuccess;
    this._keycloakInstance.onAuthError = onAuthError;
  }
}
