import React, { useEffect } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = 'danielpartidag';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

	const checkIfWalletIsConnected = () => {

		// First make sure we have access to window.ethereum = window["ethereum"]
		// window["ethereum"] is provided from MetaMask in the window
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
		return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}
	  }

	const renderNotConnectedContainer = () => (
		<div className='connect-wallet-container'>
			<img src='https://media.giphy.com/media/157anh4ffDsSA/giphy.gif' alt='Ninja gif'></img>
			<button className='cta-button connect-wallet-button'>Connect Wallet</button>
		</div>
	);

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

				{renderNotConnectedContainer()}

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
