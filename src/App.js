import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = 'danielpartidag';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const tld = ".weirdo";
const CONTRACT_ADDRESS = "0x0000";

const App = () => {

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
	  };

	const renderNotConnectedContainer = () => (
		<div className='connect-wallet-container'>
			<img src='https://media.giphy.com/media/157anh4ffDsSA/giphy.gif' alt='Ninja gif'></img>
			<button onClick={connectWallet} className='cta-button connect-wallet-button'>Connect Wallet</button>
		</div>
	);

	const renderInputForm = () => {
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
					<button className='cta-button mint-button' disabled={null} onClick={null}>
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
					</header>
				</div>

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
