import { Typography } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { useAuth } from "./context";
import { connectors } from "./utils/connectors";

function App() {
  const { active, account } = useWeb3React();
  const { connect, isAuthenticated } = useAuth();

  useEffect(() => {
    connect(connectors.metamask);
  }, []);

  useEffect(() => {
    if (!active || !isAuthenticated) return;

    console.log(account);
  }, [active, isAuthenticated]);
  return (
    <div>
      <Typography>Abc</Typography>
      <h1 className="text-red-500">sdsd</h1>
    </div>
  );
}

export default App;
