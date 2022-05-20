import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";

import MetaMaskIcon from "../components/icons/Metamask";

const injected = new InjectedConnector({});

export const connectors = {
  metamask: {
    key: "metamask",
    name: "Metamask",
    connector: injected,
    icon: MetaMaskIcon,
    rememberable: true,
  },
};

export const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
};
