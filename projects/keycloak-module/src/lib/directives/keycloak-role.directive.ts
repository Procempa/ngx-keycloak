import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';

@Directive({
  selector: '[keycloakRole]'
})
export class KeycloakRoleDirective {

  private hasView = false;

  constructor(private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private keycloakService: KeycloakService) { }

  @Input('keycloakRole')
  set kcKeycloakRole(role: string | string[]) {

    if (this.keycloakService.hasRole && typeof this.keycloakService.hasRole === 'function') {
      let roles: string[];
      Array.isArray(role) ? roles = role : roles = [role];
      const hasRole = roles.some(role => this.keycloakService.hasRole(role));

      if (!hasRole && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      } else if (hasRole && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    }
  }

}
