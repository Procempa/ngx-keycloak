# Keycloak Module AngularX

## Package and Keycloak Versions

Package Version | Keycloak Version | Branch
-|-|-
 1.0.x | ~1.6.0 | kc-1.6.0
 2.x.x | ^3.0.0 --> ^6.0.0 | v2
 3.x.x | ^3.0.0 --> ^6.0.0 | master

## Instalation

```
 npm i @procempa/ngx-keycloak
 yarn add @procempa/ngx-keycloak
```
## Import Module

At AppModule of your project import the class **NgxKeycloakModule**

``` typescript
import { NgxKeycloakModule } from '@procempa/ngx-keycloak';

@NgModule({
  declarations: [],
  imports: [    
    NgxKeycloakModule.forRoot()    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Initialization
You must create a _function_ to use as a factory to initialize the keycloak with the application on the _providers_ array.

### example

AppModule:

``` typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxKeycloakModule.forRoot()
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initKeycloak, multi: true, deps: [KeycloakService] }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Factory Function

``` typescript
export function initKeycloak(keycloak: KeycloakService) {
  const env = {
    url: environment.KEYCLOAK_URL,
    realm: environment.KEYCLOAK_REALM,
    clientId: environment.KEYCLOAK_CLIENT
  };

  return () => keycloak.init(env, { onLoad: 'login-required' });
}
```

## Interceptor

The NgxKeycloak's interceptor sends an Authorization header with a Bearer token to all requests but sometimes is necessary to not send it. 

To ignore some URLs create an array with the addresses as a _string_ or _Regex_ and pass it on initialization.

Another way to ignore the interceptor is to add *IGNORE_INTERCEPTOR* to header for the request.

### example

``` typescript
export function initKeycloak(keycloak: KeycloakService) {
  const env = {
    url: environment.KEYCLOAK_URL,
    realm: environment.KEYCLOAK_REALM,
    clientId: environment.KEYCLOAK_CLIENT
  };

  keycloak.urlsToIgnore = ['ignore.url.com', 'another.com.uk'];
  return () => keycloak.init(env, { onLoad: 'login-required' });
}
```

## Routes Guard

The routes guard can accept an array of _roles_ to protect it from navigation.

### example

``` typescript
import { KeycloakAuthGuard } from '../keycloak/guards/auth.guard';

const routes: Routes = [
  {
    path: 'myPath',
    canActivate: [KeycloakAuthGuard],
    component: AppShellComponent,
    children: [
      {
        path: '/route/administration',
        loadChildren: 'app/admin.module#AdminModule',
        canLoad: [KeycloakAuthGuard],
        data: {
          roles: ['admin', 'employee', 'manager']
        }
      },
      {
        path: '/upload',
        component: UploadComponent,
        canActivate: [KeycloakAuthGuard],
        data: {
          roles: ['employee']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyRoutingModule { }
```

### BaseKeycloakGuard 

This class can be extended to customize the validation logic. Just implement the method `isAllowed`

## Directive

The directive verify if the user has the roles for the specified client ou current client and remove or insert at _DOM_ the elements.

### example

``` html
<nav class="navbar navbar-default">
  <div class="container">
    <ul class="nav navbar-nav nav-tabs">
      <!-- allways visualized -->
      <li routerLinkActive="active"><a routerLink="./equip">Equipament</a></li>
      <!-- only rendered for a user with the ADMIN ROLE -->
      <li routerLinkActive="active" *keycloakRole="'admin'" ><a routerLink="./empresa">Empresa</a></li>
      <!-- only rendered for a user with the EMPLOYEE or ADMIN roles -->
      <li routerLinkActive="active" *keycloakRole="['employee', 'admin']"><a routerLink="./upload">Upload</a></li>
      <!-- only rendered for a user with the ADMIN role IN myapp client -->
      <li routerLinkActive="active" *keycloakRole="{myapp: ['admin']}"><a routerLink="./upload">Upload</a></li>
    </ul>
  </div>
</nav>
```
