
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

export interface KeycloakResourceAccess {
  [key: string]: KeycloakRoles
}

export interface KeycloakRoles {
  roles: string[];
}
