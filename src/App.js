import React, { useEffect } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = 'danielpartidag';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

	const checkIfWalletIsConnected = () => {

		const { ethererum }  = window;

		if (!ethererum) {
			console.log("Make sure you have MetaMask in your browser!");
			return;
		} else {
			console.log("We have ethereum object", ethererum);
		}
	}

	const renderNotConnectedContainer = () => (
		<div className='connect-wallet-container'>
			<img src='https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif' alt='Ninja gif'></img>
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
