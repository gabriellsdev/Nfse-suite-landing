/**
 * Configuração centralizada de versão e download do instalador.
 * Este arquivo é atualizado automaticamente pelo script publicar.py a cada release.
 */
export const DEFAULT_APP_VERSION = '1.5.0';
export const DEFAULT_DOWNLOAD_URL = `https://github.com/gabriellsdev/Nfse-suite-landing/releases/download/v${DEFAULT_APP_VERSION}/NFSe_Nacional_Suite_Setup_${DEFAULT_APP_VERSION}.exe`;
export const LATEST_RELEASE_API = 'https://api.github.com/repos/gabriellsdev/Nfse-suite-landing/releases/latest';
export const CHROME_WEBSTORE_URL = 'https://chromewebstore.google.com/detail/nfse-bridge-%E2%80%94-gest%C3%A3o-de-n/oandcgniinidpminhdalfijhhfpbbonf?hl=pt-BR&utm_source=ext_sidebar';

// Stripe Checkout Configurações
export const STRIPE_PUBLIC_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLIC_KEY) ||
  'pk_live_51UT1dqDHLW5dKuKNNN7yEzMuwSOmBoMNa0zYDHOhH39WifDCsVDbBhuFdhVJTJCQVSRkmTMhGk1qPqjF36aT07O300TC9yjIBr';

export const STRIPE_PRO_PRODUCT_ID = 'prod_VTzp2lJ34j06ib';
export const STRIPE_MULTI_PRODUCT_ID = 'prod_VTzqoDaoZWc15F';
