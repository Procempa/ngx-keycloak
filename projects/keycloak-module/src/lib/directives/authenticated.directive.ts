import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';

@Directive({
  selector: '[keycloakAuthenticated]'
})
export class KeycloakAuthenticatedDirective {

  private isShowing = false;

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private keycloakService: KeycloakService) { }

  @Input('keycloakAuthenticated')
  set kcKeycloakAuthenticated(showForAuthenticated: boolean) {
    if (this.keycloakService.authenticated && typeof this.keycloakService.authenticated === 'function') {
      if (this.keycloakService.authenticated() && showForAuthenticated) {
        this.showOrNot(true);
      } else if (!this.keycloakService.authenticated() && !showForAuthenticated) {
        this.showOrNot(true);
      } else {
        this.showOrNot(false);
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
