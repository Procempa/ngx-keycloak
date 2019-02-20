import { KeycloakService } from './services/keycloak.service';

export function initKeycloak(keycloakService: KeycloakService) {
  return keycloakService.init();
}
