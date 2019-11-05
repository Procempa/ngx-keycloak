/**
 * Callbacks to Keycloak events.
 * Defaults to this modules Observables
 */
export interface NgxKeycloakEvents {
  /** Called when the token is refreshed. */
  onAuthRefreshSuccess?: () => void;
  /** Called if there was an error while trying to refresh the token. */
  onAuthRefreshError?: () => void;
  /** Called when the access token is expired. */
  onTokenExpired?: () => void;
  /** Called when the adapter is initialized. */
  onReady?: (authenticated?: boolean) => void;
  /** Called if there was an error during authentication. */
  onAuthSuccess?: () => void;
  /** Called if there was an error during authentication. */
  onAuthError?: (error: Keycloak.KeycloakError) => void;
}
