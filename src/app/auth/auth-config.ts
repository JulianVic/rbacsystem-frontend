import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://myinstance1-crzbwj.us1.zitadel.cloud', // URL de tu instancia ZITADEL
  clientId: '300384420517489408', // ID del cliente configurado en ZITADEL
  redirectUri: 'http://localhost:4200/callback/', // URL a la que redirigirá ZITADEL después de iniciar sesión
  postLogoutRedirectUri: 'http://localhost:4200/', // URL para redirigir después de cerrar sesión
  responseType: 'code', // Usa el flujo PKCE
  scope: 'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:id:298723041083434695:aud urn:zitadel:iam:org:project:role:view urn:zitadel:iam:user:metadata:read', // Modificamos el scope
  showDebugInformation: true, // Opcional: útil para depuración
  strictDiscoveryDocumentValidation: false, // Opcional para evitar errores de validación estricta
  tokenEndpoint: 'https://myinstance1-crzbwj.us1.zitadel.cloud/oauth/v2/token',
};