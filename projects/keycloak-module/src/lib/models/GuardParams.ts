import { Route } from '@angular/router';
export interface GuardParams {
  isAuthenticated: boolean;
  urlAttempted: string;
  route: Route;
}
