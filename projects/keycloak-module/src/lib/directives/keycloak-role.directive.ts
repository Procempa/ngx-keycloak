import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';

@Directive({
  selector: '[keycloakRole]'
})
export class KeycloakRoleDirective {

  private isShowing = false;

  constructor(private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private keycloakService: KeycloakService) { }

  @Input('keycloakRole')
  set kcKeycloakRole(role: string | string[] | { [prop: string]: string[] }) {

    if (this.keycloakService.hasRole && typeof this.keycloakService.hasRole === 'function') {
      if (role == null) this.showOrNot(false);

      if (Array.isArray(role)) {
        const hasRole = role.some(role => this.keycloakService.hasRole(role));
        this.showOrNot(hasRole);

      } else if (typeof role === 'string') {
        const hasRole = this.keycloakService.hasRole(role);
        this.showOrNot(hasRole);

      } else {
        let hasRole = false;
        const keys = Object.keys(role);
        for (const key of keys) {
          const roles = role[key];
          hasRole = roles.some(role => this.keycloakService.hasRole(role, key));
          if (hasRole) break;
        }
        this.showOrNot(hasRole);
      }

    }
  }

  private showOrNot(show: boolean) {
    if (!show && this.isShowing) {
      this.viewContainer.clear();
      this.isShowing = false;
    } else if (show && !this.isShowing) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isShowing = true;
    }
  }

}
