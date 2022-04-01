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
const CONTRACT_ADDRESS = "0xFf1d096746C11189B9ab28C8396aEb1280De00d7";

const App = () => {

	const [network, setNetwork] = useState("");
	const [currentAccount, setCurrentAccount] = useState("");
	const [domain, setDomain] = useState("");
	const [record, setRecord] = useState("");
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [mints, setMints] = useState([]);

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

	  // fetches three things
	  // 1. All the domain names from the contract
	  // 2. The record for each domain name it got
	  // 3. The owner's address for each domain name it got
	  const fetchMints = async () => {
		  try {
			  const { ethereum } = window;
			  if (ethereum) {
				  const provider = new ethers.providers.Web3Provider(ethereum);
				  const signer = provider.getSigner();
				  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
				  
				  // get all domain names from our contract
				  // (Contract) function getAllNames() public view returns (string[] memory)
				  const names = await contract.getAllNames();

				  const mintRecords = await Promise.all(names.map(async (name) => {
					  const mintRecord = await contract.records(name); // (Contract) mapping(string => string)
					  const owner = await contract.domains(name); // (Contract) mapping(string => address)
					  return {
						  id: names.indexOf(name),
						  name: name,
						  record: mintRecord,
						  owner: owner
					  };
				  }));

				  console.log("Mints fetched ", mintRecords);
				  setMints(mintRecords);
			  }
		  } catch (error) {
			  console.error("Ups, fetched mints failed", error);
		  }
	  }

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

					setTimeout(() => {
						fetchMints();
					}, 2000);

					setRecord("");
					setDomain("");
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		} catch (error) {
			console.error("Ups, an error occurred during the transaction", error);
		}
	  }

	  const updateDomain = async () => {
		  if (!record || !domain) { return }

		  setLoading(true);
		  console.log("Updating domain", domain, "with record", record);
		  try {
			  const { ethereum } = window;
			  if (ethereum) {
				  const provider = new ethers.providers.Web3Provider(ethereum);
				  const signer = provider.getSigner();
				  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				  let txn = await contract.setRecord(domain, record);
				  await txn.wait();
				  console.log("Record set https://mumbai.polygonscan.com/tx/" + txn.hash);

				  fetchMints();
				  setRecord("");
				  setDomain("");
			  }
		  } catch (error) {
			  console.log(error);
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
					<p>Please switch to the Polygon Mumbai Testnet</p>
					<button 
						className='cta-button mint-button' 
						onClick={switchNetwork}>
						Click here to switch
					</button>
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

				{/* If editing variable is True (editing mode), 
				return the "set record" and "cancel" button */}
				{editing ? (
					<div className='button-container'>
						{/* Call the minDomain function when the button is clicked */}
						<button 
							className='cta-button mint-button' 
							disabled={loading} onClick={updateDomain}>
							Set record
						</button>
						<button 
							className='cta-button mint-button' 
							onClick={() => {setEditing(false)}}>
							Cancel
						</button>
					</div> 
				) : (
				<button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
					Mint
				</button>
				)}
			</div>	
		);
	}

	const switchNetwork = async () => {
		// Check if MetaMask is running in the browser
		if(window.ethereum) {
			try {
				// Switch network
				await window.ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: "0x13881" }],
				});
			} catch (error) {
				// Error 4902 represents that the chain is not present in MetaMask
				// Thus, we handle this by adding the chain
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: '0x13881',
									chainName: 'Polygon Mumbai Testnet',
									rcpUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
										name: 'Mumbai Matic',
										symbol: "MATIC",
										decimals: 18
									},
									blockExploreUrls: ["https://mumbai.polygonscan.com/"]
								}
							]
						});
					} catch (error) {
						console.error("Ups, we could not add the chain", error);
					}
				}
				console.error("Ups, an unknown error just occurred", error);
			}
		} else {
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		}
	}

	const renderMints = () => {
		if (currentAccount && mints.length > 0) {
			return (
				<div className="mint-container">
					<p className='subtitle'>Recently minted domains!</p>
					<div className='mint-list'>
						{ mints.map((mint, index) => {
           				return (
              				<div className="mint-item" key={index}>
                				<div className='mint-row'>
                  					<a className="link" 
									  href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} 
									  target="_blank" rel="noopener noreferrer">
                    				<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
                  					</a>
                  					{/* If mint.owner is currentAccount, add an "edit" button*/}
                  					{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                    				<button className="edit-button" onClick={() => editRecord(mint.name)}>
										<img className="edit-icon" 
										src="https://img.icons8.com/metro/26/000000/pencil.png" 
										alt="Edit button" />
                    				</button>
                    				:
                   	 				null
                  					}
								</div>
							<p> {mint.record} </p>
						</div>)
					})}
					</div>
				</div>
			);
		}
	};

	const editRecord = (name) => {
		console.log("Editing record for", name);
		setEditing(true);
		setDomain(name);
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
