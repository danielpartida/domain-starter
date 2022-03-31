import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import contractAbi from './utils/contractABI.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

// Constants
const TWITTER_HANDLE = 'danielpartidag';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const tld = ".weirdo";
const CONTRACT_ADDRESS = "0x76aCD397475022a1098A8b77DDae0aC02884C7B3";

const App = () => {

	const [network, setNetwork] = useState("");
	const [currentAccount, setCurrentAccount] = useState("");
	const [domain, setDomain] = useState("");
	const [record, setRecord] = useState("");

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			
			if (!ethereum) {
				alert("Get MetaMaks -> https://metamask.io/");
				return;
			}

			// request access to account
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });

			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.error("Wallet could not be connected", error);
		}
	}

	const checkIfWalletIsConnected = async () => {

		// First make sure we have access to window.ethereum = window["ethereum"]
		// window["ethereum"] is provided from MetaMask in the window
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
		return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}

		const chainId = await ethereum.request({ method: "eth_chainId"});
		// Fetch correct network from networks dictionary
		setNetwork(networks[chainId]);

		ethereum.on("chainChanged", handleChainChanged);

		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	  };

	  const mintDomain = async () =>  {
		//   do not run if domain is empty
		if (!domain) { return }
		// alert user if domain is too short
		if (domain.length < 3) {
			alert("Domain must be at least 3 characters long");
		}

		// Calculate price based on domain length
		const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
		console.log("Minting domain", domain, "with price", price);
		try {
			const { ethereum } = window;
			if(ethereum) {
				// provider necessary to talk with Polygon nodes
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				console.log("Going to pop wallet now to pay gas...");
				let txn = await contract.register(domain, {value: ethers.utils.parseEther(price)});
				const recipe = await txn.wait();

				if (recipe.status === 1) {
					console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + txn.hash);

					txn = await contract.setRecord(domain, record);
					await txn.wait();

					console.log("Record set! https://mumbai.polygonscan.com/tx/" + txn.hash);

					setRecord("");
					setDomain("");
				}
			}
		} catch (error) {
			console.error("Ups, an error occurred during the transaction", error);
		}
	  }

	const renderNotConnectedContainer = () => {
		return (
		<div className='connect-wallet-container'>
			<img src='https://media.giphy.com/media/157anh4ffDsSA/giphy.gif' alt='Ninja gif'></img>
			<button onClick={connectWallet} className='cta-button connect-wallet-button'>Connect Wallet</button>
		</div>
		);
	};

	const renderInputForm = () => {
		if (network !== "Polygon Mumbai Testnet") {
			return (
				<div className='connect-wallet-container'>
					<p>Please connect to the Polygon Mumbai Testnet</p>
				</div>
			);
		}

		return (
			<div className='form-container'>
				<div className='first-row'>
					<input
						type="text"
						value={domain}
						placeholder="domain"
						onChange={event => setDomain(event.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

				<input 
					type="text"
					value={record}
					placeholder="what is your weirdo power"
					onChange={event => setRecord(event.target.value)}
				/>

				<div className='button-container'>
					{/* Call the minDomain function when the button is clicked */}
					<button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
						Mint
					</button>
					<button className='cta-button mint-button' disabled={null} onClick={null}>
						Set data
					</button>
				</div>
			</div>
		);
	}

	// this runs the function when the page loads
	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

  return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
            			<div className="left">
              			<p className="title">🤪 WeirDAO Name Service</p>
              			<p className="subtitle">Your immortal API on the blockchain!</p>
						</div>
						{/* Displaz a logo and wallet connection status*/}
						<div className='right'>
							<img alt='Network Logo' className='logo' src={ network.includes("Polygon") ? polygonLogo : ethLogo } />
							{ currentAccount ? <p> Wallet: {currentAccount.slice(0,6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
						</div>
					</header>
				</div>
				
				{/* Render gif if no wallet is conencted*/}
				{!currentAccount && renderNotConnectedContainer()}
				{/* Render the input form if an account is connected */}
				{currentAccount && renderInputForm()}

        		<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
