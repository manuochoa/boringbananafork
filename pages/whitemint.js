import Head from "next/head";
import Web3 from "web3";
import { useState, useEffect } from "react";

import { ADDRESS, ABI } from "../config.js";

export default function WhiteMint() {
  // FOR WALLET
  const [signedIn, setSignedIn] = useState(false);

  const [walletAddress, setWalletAddress] = useState(null);

  // FOR MINTING
  const [how_many_bananas, set_how_many_bananas] = useState(1);

  const [trait, setTrait] = useState(1);

  const [bananaContract, setBananaContract] = useState(null);

  // INFO FROM SMART Contract

  const [totalSupply, setTotalSupply] = useState(0);

  const [saleStarted, setSaleStarted] = useState(false);

  const [whitelistStarted, setWhitelistStarted] = useState(false);

  const [bananaPrice, setBananaPrice] = useState(0);

  useEffect(async () => {
    signIn();
    callContractData();
  }, []);

  async function signIn() {
    if (typeof window.web3 !== "undefined") {
      // Use existing gateway
      window.web3 = new Web3(window.ethereum);
    } else {
      alert("No Ethereum interface injected into browser. Read-only access");
    }

    window.ethereum
      .enable()
      .then(function (accounts) {
        window.web3.eth.net
          .getNetworkType()
          // checks if connected network is mainnet (change this to rinkeby if you wanna test on testnet)
          .then((network) => {
            console.log(network);
            if (network != "rinkeby") {
              alert(
                "You are on " +
                  network +
                  " network. Change network to mainnet or you won't be able to do anything here"
              );
            }
          });
        let wallet = accounts[0];
        setWalletAddress(wallet);
        setSignedIn(true);
        callContractData(wallet);
      })
      .catch(function (error) {
        // Handle error. Likely the user rejected the login
        console.error(error);
      });
  }

  //

  async function signOut() {
    setSignedIn(false);
  }

  async function callContractData(wallet) {
    let web3;
    if (typeof window.web3 !== "undefined") {
      // Use existing gateway
      web3 = new Web3(window.ethereum);
    } else {
      web3 = new Web3(
        "https://rinkeby.infura.io/v3/a8ed213665484d9eba057b5ee327f8e0"
      );
    }

    const bananaContract = new web3.eth.Contract(ABI, ADDRESS);

    setBananaContract(bananaContract);

    const salebool = await bananaContract.methods.publicSale().call();
    console.log("saleisActive", salebool);
    setSaleStarted(salebool);

    const whitesalebool = await bananaContract.methods.onlyWhitelist().call();
    console.log("saleisActive", whitesalebool);
    setWhitelistStarted(whitesalebool);

    const totalSupply = await bananaContract.methods.totalSupply().call();
    setTotalSupply(totalSupply);

    const bananaPrice = await bananaContract.methods.price().call();
    setBananaPrice(bananaPrice);
  }

  async function mintBanana(how_many_bananas) {
    if (bananaContract) {
      const price = Number(bananaPrice) * how_many_bananas;

      const gasAmount = await bananaContract.methods
        .buy(how_many_bananas)
        .estimateGas({ from: walletAddress, value: price });
      console.log("estimated gas", gasAmount);

      console.log({ from: walletAddress, value: price });

      bananaContract.methods
        .buy(how_many_bananas)
        .send({ from: walletAddress, value: price, gas: String(gasAmount) })
        .on("transactionHash", function (hash) {
          console.log("transactionHash", hash);
        });
    } else {
      console.log("Wallet not connected");
    }
  }

 async function whiteMintBanana(how_many_bananas) {
    if (bananaContract) {
      const price = Number(bananaPrice) * how_many_bananas;

      const isOnWhitelist = await bananaContract.methods
        .isWhitelisted(walletAddress)
        .call();
      console.log(isOnWhitelist);
      if (isOnWhitelist) {
        const gasAmount = await bananaContract.methods
          .whiteListBuy(how_many_bananas, trait)
          .estimateGas({ from: walletAddress, value: price });
        console.log("estimated gas", gasAmount);
        console.log(how_many_bananas, trait);

        console.log({ from: walletAddress, value: price });

        bananaContract.methods
          .whiteListBuy(how_many_bananas, trait)
          .send({ from: walletAddress, value: price, gas: String(gasAmount) })
          .on("transactionHash", function (hash) {
            console.log("transactionHash", hash);
          });
      } else {
        window.alert("you're not on the whitelist");
      }
    } else {
      console.log("Wallet not connected");
    }
  }

  return (
    <div
      id="bodyy"
      className="flex flex-col items-center justify-center min-h-screen py-2"
    >
      <Head>
        <title>Boring Bananas Company</title>
        <link rel="icon" href="/images/favicon.jpg" />

        <meta property="og:title" content="Boring Bananas Co." key="ogtitle" />
        <meta
          property="og:description"
          content="Here at Boring Bananas company, we specialise in the world's finest digital bananas. We've put together a team spanning 3 continents, to bring you some of the most ‍NUTRITIOUS and DELICIOUS
bananas out known to man."
          key="ogdesc"
        />
        <meta property="og:type" content="website" key="ogtype" />
        <meta
          property="og:url"
          content="https://boringbananas.co/"
          key="ogurl"
        />
        <meta
          property="og:image"
          content="https://boringbananas.co/images/Hola.gif"
          key="ogimage"
        />
        <meta
          property="og:site_name"
          content="https://boringbananas.co/"
          key="ogsitename"
        />

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta
          property="twitter:domain"
          content="boringbananas.co"
          key="twdomain"
        />
        <meta
          property="twitter:url"
          content="https://boringbananas.co/"
          key="twurl"
        />
        <meta name="twitter:title" content="Boring Bananas Co." key="twtitle" />
        <meta
          name="twitter:description"
          content="Here at boring Bananas company, we specialise in the world's finest digital bananas. We've put together a team spanning 3 continents, to bring you some of the most ‍NUTRITIOUS and DELICIOUS
bananas out known to man."
          key="twdesc"
        />
        <meta
          name="twitter:image"
          content="https://boringbananas.co/images/Hola.gif"
          key="twimage"
        />
      </Head>

      <div>
        <div className="flex items-center justify-between w-full border-b-2	pb-6">
          <a href="/" className="">
            <img
              src="images/Hola.gif"
              width="108"
              alt=""
              className="logo-image"
            />
          </a>
          <nav className="flex flex-wrap flex-row justify-around Poppitandfinchsans">
            <a
              href="/#about"
              className="text-4xl text-white hover:text-black m-6"
            >
              About
            </a>
            <a
              href="/mint"
              className="text-4xl text-white hover:text-black m-6"
            >
              Mint!
            </a>
            <a
              href="/whitemint"
              className="text-4xl text-white hover:text-black m-6"
            >
              Whitelist MINT!
            </a>
            <a
              href="/#traits"
              className="text-4xl text-white hover:text-black m-6"
            >
              Banana traits
            </a>
            <a
              href="/#roadmap"
              className="text-4xl text-white hover:text-black m-6"
            >
              Roadmap
            </a>
            <a
              href="/#team"
              className="text-4xl text-white hover:text-black m-6"
            >
              Team
            </a>
            <a
              href="/#contact"
              className="text-4xl text-white hover:text-black m-6"
            >
              Contact
            </a>
            <a
              href="https://twitter.com/boringbananasco"
              className="text-4xl  hover:text-white m-6 text-blau"
            >
              TWITTER
            </a>
            <a
              href="https://discord.gg/8Wk9Hp6UyV"
              className="text-4xl  hover:text-white m-6 text-blau"
            >
              DISCORD
            </a>
          </nav>
        </div>
        <div className="flex auth my-8 font-bold  justify-center items-center vw2">
          {!signedIn ? (
            <button
              onClick={signIn}
              className="montserrat inline-block border-2 border-black bg-white border-opacity-100 no-underline hover:text-black py-2 px-4 mx-4 shadow-lg hover:bg-blue-500 hover:text-gray-100"
            >
              Connect Wallet with Metamask
            </button>
          ) : (
            <button
              onClick={signOut}
              className="montserrat inline-block border-2 border-black bg-white border-opacity-100 no-underline hover:text-black py-2 px-4 mx-4 shadow-lg hover:bg-blue-500 hover:text-gray-100"
            >
              Wallet Connected: {walletAddress}
            </button>
          )}
        </div>
      </div>

      <div className="md:w-2/3 w-4/5">
        <div className="mt-6 border-b-2 py-6">
          <div className="flex flex-col items-center">
            <span className="flex Poppitandfinchsans text-5xl text-white items-center bg-grey-lighter rounded rounded-r-none my-4 ">
              WHITELIST MINT
              <br />
              TOTAL BANANAS MINTED:{" "}
              <span className="text-blau text-6xl">
                {" "}
                {!signedIn ? <>-</> : <>{totalSupply}</>} / 10000
              </span>
            </span>
            <div id="mint" className="flex justify-around  mt-8 mx-6">
              <span className="flex Poppitandfinchsans text-5xl text-white items-center bg-grey-lighter rounded rounded-r-none px-3 font-bold">
                GIMME
              </span>

              <input
                type="number"
                min="1"
                max="20"
                value={how_many_bananas}
                onChange={(e) => set_how_many_bananas(e.target.value)}
                name=""
                className="Poppitandfinchsans pl-4 text-4xl  inline bg-grey-lighter  py-2 font-normal rounded text-grey-darkest  font-bold"
              />

              <span className="flex Poppitandfinchsans text-5xl text-white items-center bg-grey-lighter rounded rounded-r-none px-3 font-bold">
                BANANAS!
              </span>
              <br />
            </div>
            <div id="mint" className="flex justify-around  mt-8 mx-6">
              <span className="flex Poppitandfinchsans text-5xl text-white items-center bg-grey-lighter rounded rounded-r-none px-3 font-bold">
                <label for="trait">Choose a trait:</label>
              </span>
              <select
                name="trait"
                id="trait"
                onChange={(e) => setTrait(e.target.value)}
                className="Poppitandfinchsans pl-4 text-4xl  inline bg-grey-lighter  py-2 font-normal rounded text-grey-darkest  font-bold"
              >
                <option
                  className="Poppitandfinchsans pl-4 text-4xl  inline bg-grey-lighter  py-2 font-normal rounded text-grey-darkest  font-bold"
                  value="0"
                >
                  trait 0
                </option>
                <option
                  className="Poppitandfinchsans pl-4 text-4xl  inline bg-grey-lighter  py-2 font-normal rounded text-grey-darkest  font-bold"
                  value="1"
                >
                  trait 1
                </option>
                <option
                  className="Poppitandfinchsans pl-4 text-4xl  inline bg-grey-lighter  py-2 font-normal rounded text-grey-darkest  font-bold"
                  value="2"
                >
                  trait 2
                </option>
                <option
                  className="Poppitandfinchsans pl-4 text-4xl  inline bg-grey-lighter  py-2 font-normal rounded text-grey-darkest  font-bold"
                  value="3"
                >
                  trait 3
                </option>
              </select>
            </div>
            {whitelistStarted ? (
              <button
                onClick={() => whiteMintBanana(how_many_bananas)}
                className="mt-4 Poppitandfinchsans text-4xl border-6 bg-blau  text-white hover:text-black p-2 "
              >
                WHITELIST MINT {how_many_bananas} bananas for{" "}
                {(bananaPrice * how_many_bananas) / 10 ** 18} ETH + GAS
              </button>
            ) : (
              <button className="mt-4 Poppitandfinchsans text-4xl border-6 bg-blau  text-white hover:text-black p-2 ">
                WHITELIST SALE IS NOT ACTIVE OR NO WALLET IS CONNECTED
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
