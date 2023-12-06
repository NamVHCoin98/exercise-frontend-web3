import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import "./App.css";
import { SetNameAbi, USDCAbi } from "./constants";

const App = () => {
  const adr = "0xf9Bd21d3fA07001663b2659eBe399Bf70179EbaA";
  const rpc = "https://eth-sepolia.public.blastapi.io";
  const to = "0xc5bA6A1163712c0E43055Ac6cF14d53Af25B3f92";
  const pk =
    "0x571564202935060fc8008d8522f2f81cb5fd9f9573ee506b6e5f9f80f430a9c1";

  const [isConnected, setIsConnected] = useState(false);

  const inputAddressRef = useRef();
  const inputNameRef = useRef();

  // Send Token web3
  const sendTokenUseWeb3Js = async () => {
    const amount = "0.001";
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    const nonce = await web3.eth.getTransactionCount(adr);

    const gasAmount = await web3.eth.estimateGas({
      to: to,
      from: adr,
      value: Web3.utils.toWei(amount, "ether"),
    });

    // web3.eth
    //   .sendTransaction({
    //     from: adr,
    //     to,
    //     value: "0x0",
    //     // value: Web3.utils.toWei(amount, "ether"),
    //     // nonce: Web3.utils.toHex(nonce),
    //     // gasLimit: Web3.utils.toHex(21000),
    //     // gasPrice: Web3.utils.toHex(gasAmount),
    //     // chainId: "0xaa36a7"
    //   })
    //   .on("transactionHash", function (hash) {
    //     console.log(hash);
    //   })
    //   .on("receipt", function (receipt) {
    //     console.log(receipt);
    //   })
    //   .on("error", console.error);

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to,
        nonce: Web3.utils.toHex(nonce),
        gasLimit: Web3.utils.toHex(gasAmount),
      },
      pk
    );

    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .once("transactionHash", (hash) => {
        console.log(hash);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // Send Token
  const sendETH = async () => {
    const checkPermission = await window.ethereum.request({
      method: "wallet_getPermissions",
    });

    if (checkPermission) {
      const amount = "0.001";
      const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
      const nonce = await web3.eth.getTransactionCount(adr);

      const gasAmount = await web3.eth.estimateGas({
        to: to,
        from: adr,
        value: Web3.utils.toWei(amount, "ether"),
      });

      const params = [
        {
          from: "0xf9Bd21d3fA07001663b2659eBe399Bf70179EbaA",
          to,
          value: Web3.utils.toWei(amount, "ether"),
          nonce: Web3.utils.toHex(nonce),
          gasLimit: Web3.utils.toHex(gasAmount),
        },
      ];

      await window.ethereum
        .request({
          method: "eth_sendTransaction",
          params: params,
        })
        .then((res) => console.log(res))
        .catch((error) => console.log(error));
    }
  };

  // Get balance
  const getBalance = async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
    const balance = await web3.eth.getBalance(adr);
    const etherBalance = web3.utils.fromWei(balance, "ether");
    console.log(etherBalance);
  };

  const handleConnectWallet = () => {
    if (isConnected) {
      window.ethereum.disconnect();
    } else {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts[0]) {
          console.log(accounts);
          setIsConnected(true);
        } else {
          console.log("Wallet not found");
        }
      });
    }
  };

  const switchChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "ETH sepolia",
                rpcUrls: [rpc],
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
          switchChain();
        } catch (addError) {
          console.log(addError);
        }
      }
    }
  };

  const addBNBChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x61" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x61",
                chainName: "BNB test",
                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
              },
            ],
          });
          addBNBChain();
        } catch (addError) {
          console.log(addError);
        }
      }
    }
  };

  const getTokenBalance = async () => {
    const address = inputAddressRef.current.value;
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        "https://mainnet.infura.io/v3/92d53cee52834368b0fabb42fa1b5570"
      )
    );
    const USDContractInstance = await new web3.eth.Contract(
      USDCAbi,
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    );

    const balance = await USDContractInstance.methods.balanceOf(address).call();
    const resultInEther = Web3.utils.fromWei(balance, "ether");
    console.log(resultInEther);
  };

  const handleSetName = async () => {
    const name = inputNameRef.current.value;

    const addressContract = "0xc06fdEbA4F7Fa673aCe5E5440ab3d495133EcE7a";
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        "https://data-seed-prebsc-1-s1.binance.org:8545"
      )
    );

    const actionNameContract = await new web3.eth.Contract(
      SetNameAbi,
      addressContract
    );

    const data = await actionNameContract.methods.set(name).encodeABI();

    const gasAmount = await web3.eth.estimateGas({
      to: addressContract,
      data,
    });

    await web3.eth.accounts
      .signTransaction(
        {
          from: adr,
          to: addressContract,
          data: data,
          gasLimit: Web3.utils.toHex(gasAmount),
        },
        pk
      )
      .then((tx) => {
        web3.eth
          .sendSignedTransaction(tx.rawTransaction)
          .once("transactionHash", (hash) => {
            console.log(hash);
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((error) => console.log(error));
  };

  window.ethereum.on("disconnect", () => {
    setIsConnected(false);
  });

  useEffect(() => {
    if (window.coin98 || window.ethereum || window.ethereum?.isCoin98) {
      if (!window.ethereum.isConnected()) {
        window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
          if (accounts[0]) {
            setIsConnected(true);
          } else {
            console.log("Wallet not found");
          }
        });
      }
    }
    getBalance();
  }, [window.coin98, window.ethereum, window.ethereum?.isCoin98]);

  return (
    <div className="App">
      <button onClick={handleConnectWallet}>
        {isConnected ? "Disconnect" : "Connect"}
      </button>
      <button onClick={switchChain}>Switch ETH sepolia chain</button>
      <button onClick={sendTokenUseWeb3Js}>Send ETH</button>
      <button onClick={sendETH}>Send ETH with Wallet</button>
      <div>
        <input
          ref={inputAddressRef}
          id="address"
          placeholder="Address to get balance"
        ></input>
        <button onClick={getTokenBalance}>Get USDC balance</button>
      </div>

      <div>
        <button onClick={addBNBChain}>Add BNB test chain</button>
        <input ref={inputNameRef} placeholder="Name"></input>
        <button onClick={handleSetName}>Set name</button>
      </div>
    </div>
  );
};

export default App;
