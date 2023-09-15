export default {
  appNamespace: process.env.BASE_APP_NAMESPACE ?? 'auth',
  servicePort: process.env.BASE_APP_PORT ?? '3020',
  jwtSecret: process.env.AUTH_ACCESS_JWT_SECRET,
  jwtForResetPasswordSecret: process.env.AUTH_ACCESS_JWT_SECRET_RESET_PASSWORD,
  mainSiteURL: process.env.MAIN_SITE_URL,
  intraServiceApiEndpoints: {
    nes: process.env.INTRA_SERVICE_NOTIFICAION_SERVICE_URL,
    client: process.env.INTRA_SERVICE_SELLER_CLIENT_SERVICE_URL,
  },
  mmi: {
    secret: process.env.MMI_CLIENT_SECRET,
    id: process.env.MMI_CLIENT_ID,
    apiKey: process.env.MMI_ADVANCE_API_KEY,
  },
};
