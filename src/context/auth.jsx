import { createContext, useContext, useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import { ethers } from "ethers";
import { signMessage } from "../utils/signMessage";
import toast from "../utils/toastPresets";
import switchNetwork from "../utils/switchNetwork";
import { connectors } from "../utils/connectors";

const AuthContext = createContext({
  isLoading: false,
  chainError: false,
  isAuthenticated: false,
  connect: (connector) => {},
  disconnect: () => {},
});

export function useAuth() {
  const store = useContext(AuthContext);

  return store;
}

export function AuthProvider({ children }) {
  const {
    active,
    activate,
    deactivate,
    chainId,
    account,
    library,
    activeConnector,
  } = useWeb3React();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chainError, setChainError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connect = (connector, auto = false) => {
    //Try to get remembered connector with localStorage key
    const rememberedConnector = connectors[localStorage.getItem("connector")];

    //If connector isn't specified we search it on localStorage
    if (!connector) {
      if (!rememberedConnector) return localStorage.removeItem("connector");

      connector = rememberedConnector;
    }

    //Here we delete saved connector anyway
    localStorage.removeItem("connector");

    const connecterToUse = connector.connector;

    setIsLoading(true);

    //Try to activate connector
    //When it is successful
    //and if connector is rememberable save it on localStorage
    activate(connecterToUse, (err) => {
      setIsLoading(false);

      //If current connection attempt is auto don't display error message
      if (auto) return;

      //If user tries to connect with metamask and
      //user doesn't have metamask installed show error
      if (
        connector.key === "metamask" &&
        err instanceof NoEthereumProviderError
      ) {
        //TODO: replace this error message with translated one
        return toast.error("no_wallet " + connector.key);
      }
    }).then(
      () =>
        connector.rememberable &&
        localStorage.setItem("connector", connector.key)
    );
  };

  //Disconnect and clear remembered connector from localStorage
  const disconnect = () => {
    localStorage.removeItem("connector");
    deactivate();
  };

  //When page is loaded, try to login with remembered connector
  useEffect(() => connect(undefined, true), []);

  //When wallet activated if wallet's connected chain
  //is specified chain, try to login with login endpoint
  useEffect(() => {
    if (!active || !account || !chainId) return;
    if (chainId !== Number(import.meta.env.VITE_APP_CHAIN_ID)) return;

    setIsAuthenticated(false);
    setIsLoading(true);

    const referrer = new URLSearchParams(window.location.search).get(
      "referrer"
    );

    //If signedMessage exists in localStorage and
    //has been signed by connected wallet return that signed message
    //Otherwise sign new message and return new signed message
    const signOrGetSignedMessage = async () => {
      let signedMessage = localStorage.getItem("signedMessage");

      if (signedMessage) {
        try {
          const messageSigner = ethers.utils.verifyMessage(
            import.meta.env.VITE_APP_SIGN_MESSAGE,
            signedMessage
          );

          if (messageSigner === account) return signedMessage;
        } catch (err) {}
      }

      toast.emoji("sign_login_message", "✍️");

      //Try to sign message
      signedMessage = await signMessage(
        activeConnector,
        library,
        account,
        import.meta.env.VITE_APP_SIGN_MESSAGE
      );

      localStorage.setItem("signedMessage", signedMessage);

      return signedMessage;
    };

    //Firstly sign or get signed message
    //then try to login
    signOrGetSignedMessage()
      .then((signedMessage) => {
        setIsAuthenticated(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
        disconnect();
        setIsLoading(false);
      });
  }, [active, deactivate, account, chainId]);

  //When wallet activated, if wallet's connected chain is
  //specified chain, try to switch(try to add network if not exists) to specified chain
  useEffect(() => {
    if (!chainId || !active) return;

    if (chainId !== Number(import.meta.env.VITE_APP_CHAIN_ID)) {
      setChainError(true);
      setIsAuthenticated(false);
      setIsLoading(false);

      if (!library?.provider?.request) {
        return;
      }

      const handleNetworkSwitch = async () => {
        try {
          await switchNetwork(library, {
            tryToAddChain: true,
            chainID: import.meta.env.VITE_APP_CHAIN_ID_HEX,
            chainName: import.meta.env.VITE_APP_CHAIN_NAME,
            rpcUrl: import.meta.env.VITE_APP_NETWORK_URL,
            nativeCurrency: import.meta.env.VITE_APP_CHAIN_CURRENCY,
            blockExplorerUrl: import.meta.env.VITE_APP_CHAIN_EXPLORER,
          });
        } catch (error) {
          toast.error(error.message);
        }
      };

      handleNetworkSwitch();
    } else {
      setChainError(false);
    }
  }, [chainId, library, active]);

  //When user disconnects from connected wallet
  //reset error and auth state
  useEffect(() => {
    if (!active) {
      setChainError(false);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [active]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        chainError,
        connect,
        disconnect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
