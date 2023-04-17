import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { initTariConnection, TariConnection, TariConnectorButton } from "tari-connector";

function App() {
  // ===============================================================================================================================
  // THIS jsonRpc function IS FOR TESTING THE LOCAL WALLET DAEMON ONLY !!!
  const jsonRpc = async (method: string, token?: string, params?: any) => {
    let id = 0;
    id += 1;
    let address = "localhost:9000";
    let text = await (await fetch("json_rpc_address")).text();
    if (/^\d+(\.\d+){3}:[0-9]+$/.test(text)) {
      address = text;
    }
    let headers: { [key: string]: string } = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (!params) {
      params = [];
    }
    console.log("params ", params);
    let response = await fetch(`http://${address}`, {
      method: "POST",
      body: JSON.stringify({
        method: method,
        jsonrpc: "2.0",
        id: id,
        params: params,
      }),
      headers: headers,
    });
    let json = await response.json();
    if (json.error) {
      throw json.error;
    }
    return json.result;
  };
  // UNTIL HERE
  // ===============================================================================================================================
  const [tari, setTari] = useState<any>();
  const [connected, setConnected] = useState(false);
  const onOpen = (tari: TariConnection) => {
    setTari(tari);
    tari.onopen = () => {
      setConnected(true);
      console.log("data channel is open");
    };
    console.log("onOpen");
    // ===============================================================================================================================
    // THIS IS FOR TESTING THE LOCAL WALLET DAEMON ONLY !!!
    // At this point the website has send the data to the signaling server now the wallet needs to scan the qr code or enter manually.
    // We call the daemon here to show the flow.
    jsonRpc("auth.login").then((token) => {
      // You login to your wallet daemon to get the JWT token (it's not the same token as the one used for signaling server, 
      // but it's the same as all the calls to the webrtc will use for the json calls to the daemon)
      // Now we start the webrtc, so we need to tell the wallet daemon what JWT token should it use for the communication 
      // with the signaling server and we also need to send our JWT token to be able to call the webrtc.start method
      // There are two JWT tokens, don't mixed them up :-)
      console.log("tari.token", tari.token)
      jsonRpc("webrtc.start", token, tari.token);
      // Now the data channel should open, the user can override the callback above for the notification.
      // You can encounter error like I do (from the wallet daemon): 
      // WARN  [controlled]: failed to resolve stun host: stun.l.google.com:19302: io error: No available ipv6 IP address found!
      // My provider is only ipv6 from outside so I can't connect even with this, and I didn't find any free ipv6 turn server.
    });
    // UNTIL HERE
    // ===============================================================================================================================
  };
  return (
    <div className="App">
      {connected ? <div>I'm connected!!!</div> :
        <TariConnectorButton onOpen={onOpen} />
      }
    </div>
  );
}

export default App;
