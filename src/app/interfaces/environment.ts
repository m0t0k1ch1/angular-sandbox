export interface Environment {
  unWalletClientSDK: {
    env: 'prod' | 'dev';
    clientID: string;
    redirectURL: string;
    idTokenIssuer: string;
  };
}
