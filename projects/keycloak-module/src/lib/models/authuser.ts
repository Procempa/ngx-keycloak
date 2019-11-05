import { KeycloakResourceAccess } from 'keycloak-js';

export interface AuthUser {
  surname: string;
  name: string;
  fullName: string;
  email: string;
  username: string;
  attributes: {
    [key: string]: string[]
  },
  roles: KeycloakResourceAccess
}
