export interface AuthUser {
  surname: string;
  name: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
  attributes: {
    [key: string]: string[]
  }
}
