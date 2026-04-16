export type Env = {
  unWalletClientSDK: {
    env: 'prod' | 'dev';
    clientID: string;
    redirectURL: string;
    idTokenIssuer: string;
  };
};
