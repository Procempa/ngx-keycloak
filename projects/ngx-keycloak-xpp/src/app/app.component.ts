import { Component } from '@angular/core';
import { KeycloakService } from 'ngx-keycloak';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngx-keycloak-xpp';
  username = 'testes'

  constructor(private keycloak: KeycloakService) {

    setTimeout(() => {
      keycloak.getUser().subscribe(u => this.username = u.username);
    }, 2000);
  }

  logout() {
    this.keycloak.logout();
  }
}
