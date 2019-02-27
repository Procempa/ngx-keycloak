// Type definitions for Keycloak JS Adapter 1.9.8.Final
// Project: https://github.com/keycloak/keycloak
// Definitions by: Márcio Luis Soster Arrosi <https://github.com/marcioluis>,
// Definitions: https://github.com/marcioluis/typed-keycloak
// Reference: https://keycloak.gitbooks.io/securing-client-applications-guide/content/v/1.9/topics/oidc/javascript-adapter.html

declare class Keycloak {
  constructor(opts?: string | { [key: string]: any });

  /** true if the user is authenticated */
  authenticated?: boolean;
  /** the base64 encoded token that can be sent in the Authorization header in requests to services */
  token?: string;
  /** the parsed token */
  tokenParsed?: Keycloak.AccessToken;
  /** the user id */
  subject?: string;
  /** the id token if claims is enabled for the application, null otherwise */
  idToken?: string;
  /** the parsed id token */
  idTokenParsed?: Keycloak.TokenID;
  /** the realm roles associated with the token */
  realmAccess?: Keycloak.Access;
  /** the resource roles associated with the token */
  resourceAccess?: { [clientRole: string]: Keycloak.Access };
  /** the base64 encoded token that can be used to retrieve a new token */
  refreshToken?: string;
  /** the parsed refresh token */
  refreshTokenParsed?: Keycloak.AccessToken;
  /** estimated skew between local time and Keycloak server in seconds */
  timeSkew?: number;
  /** responseMode passed during initialization. Default value is fragment */
  responseMode?: string;
  /** OpenID Connect flow passed during initialization. See Implicit flow for details. */
  flow?: string;
  /** responseType used for send to Keycloak server at login request. This is determined based on the flow value used during initialization, but you have possibility to override it by directly set this value */
  responseType?: string;

  /**
   * Called to initialize the adapter.
   *
   * Options is an Object, where':'
   *
   * onLoad - specifies an action to do on load, can be either 'login-required' or 'check-sso'
   * token - set an initial value for the token
   * refreshToken - set an initial value for the refresh token
   * idToken - set an initial value for the id token (only together with token or refreshToken)
   * timeSkew - set an initial value for skew between local time and Keycloak server in seconds (only together with token or refreshToken)
   * checkLoginIframe - set to enable/disable monitoring login state (default is true)
   * checkLoginIframeInterval - set the interval to check login state (default is 5 seconds)
   * responseMode - set the OpenID Connect response mode send to Keycloak server at login request. Valid values are query or fragment . Default value is fragment, which means that after successful authentication will Keycloak redirect to javascript application with OpenID Connect parameters added in
   * URL fragment. This is generally safer and recommended over query.
   * flow - set the OpenID Connect flow. Valid values are standard, implicit or hybrid. See Implicit flow for details.
   * Returns promise to set functions to be invoked on success or error.
   */
  init(options?): Keycloak.KeycloakPromise<boolean>;

  /**
   * Redirects to login form on (options is an optional object with redirectUri and/or prompt fields)
   * Options is an Object, where:
   * redirectUri - specifies the uri to redirect to after login
   * prompt - can be set to 'none' to check if the user is logged in already (if not logged in, a login form is not displayed)
   * loginHint - used to pre-fill the username/email field on the login form
   * action - if value is 'register' then user is redirected to registration page, otherwise to login page
   * locale - specifies the desired locale for the UI
   */
  login(options?): void;
  /**
   * Returns the url to login form on (options is an optional object with redirectUri and/or prompt fields)
   * Options is an Object, where:
   * redirectUri - specifies the uri to redirect to after login
   * prompt - can be set to 'none' to check if the user is logged in already (if not logged in, a login form is not displayed)
   */
  createLoginUrl(options?): string;
  /**
   * Redirects to logout
   * Options is an Object, where:
   * redirectUri - specifies the uri to redirect to after logout
   */
  logout(options?): void;

  /**
   * Returns logout out
   * Options is an Object, where:
   * redirectUri - specifies the uri to redirect to after logout
   */
  createLogoutUrl(options?): string;

  /**
   * Redirects to registration form. It's a shortcut for doing login with option action = 'register'
   * Options are same as login method but 'action' is overwritten to 'register'
   */
  register(options?): void;

  /**
   * Returns the url to registration page. It's a shortcut for doing createRegisterUrl with option action = 'register'
   * Options are same as createLoginUrl method but 'action' is overwritten to 'register'
   */
  createRegisterUrl(options?): string;

  /**
   * Redirects to account management
   */
  accountManagement(): void;

  /**
   * Returns the url to account management
   */
  createAccountUrl(): string;

  /**
   * Returns true if the token has the given realm role
   */
  hasRealmRole(role): boolean;

  /**
   * Returns true if the token has the given role for the resource (resource is optional, if not specified clientId is used)
   */
  hasResourceRole(role, resource?): boolean;

  /**
   * Loads the users profile
   * Returns promise to set functions to be invoked on success or error.
   */
  loadUserProfile(): Keycloak.KeycloakPromise<any>;

  /**
   * Returns true if the token has less than minValidity seconds left before it expires (minValidity is optional, if not specified 0 is used)
   */
  isTokenExpired(minValidity?): boolean;

  /**
   * If the token expires within minValidity seconds (minValidity is optional, if not specified 0 is used) the token is refreshed. If the session status iframe is enabled, the session status is also checked.
   * Returns promise to set functions that can be invoked if the token is still valid, or if the token is no longer valid.
   */
  updateToken(minValidity?): Keycloak.KeycloakPromise<boolean>;

  /**
   * Clear authentication state, including tokens. This can be useful if application has detected the session has expired, for example if updating token fails. Invoking this results in onAuthLogout callback listener being invoked
   */
  clearToken(): void;

  // events//
  /** Called when the adapter is initialized */
  onReady(authenticated: boolean): void;
  /** Called when a user is successfully authenticated. */
  onAuthSuccess(): void;
  /** Called if there was an error during authentication */
  onAuthError(): void;
  /** Called when the token is refreshed */
  onAuthRefreshSuccess(): void;
  /** Called if there was an error while trying to refresh the token */
  onAuthRefreshError(): void;
  /** Called if the user is logged out (will only be called if the session status iframe is enabled, or in Cordova mode). */
  onAuthLogout(): void;
  /** Called when the access token is expired. When this happens you can for refresh the token, or if refresh is not available (ie. with implicit flow) you can redirect to login screen. */
  onTokenExpired(): void;
}

declare namespace Keycloak {
  interface JWToken {
    /** id */
    jti?: string;
    /** expiration */
    exp?: number;
    /** not before */
    nbf?: number;
    /** issued at */
    iat?: number;
    /** issuer */
    iss?: string;
    /** audience */
    aud?: string;
    /** subject */
    sub?: string;
    /** type */
    typ?: string;
    /** issued for */
    azp?: string;
  }
  interface TokenID extends JWToken {
    nonce?: string;
    session_state?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    middle_name?: string;
    nickname?: string;
    preferred_username?: string;
    profile?: string;
    picture?: string;
    website?: string;
    email?: string;
    email_verified?: boolean;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    address?: AddressClaim;
    updated_at?: number;
    claims_locales?: string;
  }
  interface AccessToken extends TokenID {
    client_session?: string;
    'trusted-certs'?: string[];
    'allowed-origins'?: string[];
    realm_access?: Access;
    resource_access?: { [clientRole: string]: Access };
  }
  interface Access {
    roles?: string[];
    verify_caller?: boolean;
  }
  interface AddressClaim {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  }

  interface KeycloakPromise<T> {
    success<TResult>(onfulfilled?: (value: T) => TResult): KeycloakPromise<TResult>;
    error<TResult>(onfulfilled?: (value: T) => TResult): KeycloakPromise<TResult>;
  }
}

declare module 'keycloak-js' {
  export = Keycloak;
}


