export const signMessage = async (connector, provider, account, message) => {
  return provider.getSigner(account).signMessage(message);
};
