import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import contractAbi from "./abis/contractabi.json";
import {RelayProvider} from "@opengsn/provider"
import {ethers} from "ethers";

const AcceptingPaymasterAddress ="0x7C10d29cfc9951958d8ffF6d9D9c9697A146bf70"

function App() {
  const contractABI = contractAbi.abi

    let theContract
    let provider

  const loadBlockchainData= async()=>{
    
    if (!window.ethereum) {
            throw new Error('provider not found')
        }
        window.ethereum.on('accountsChanged', () => {
            console.log('acct');
            window.location.reload()
        })
        window.ethereum.on('chainChanged', () => {
            console.log('chainChained');
            window.location.reload()
        })
        const networkId = await window.ethereum.request({method: 'net_version'})


        // const gsnProvider = await RelayProvider.newProvider({
        //   provider: window.ethereum,
        //   config: {
        //      paymasterAddress: AcceptingPaymasterAddress
        //   }
        // }).init()


        provider = new ethers.providers.Web3Provider(window.ethereum)
;
        const network = await provider.getNetwork()
        const artifactNetwork = contractAbi.networks[networkId]
        if (!artifactNetwork)
            throw new Error('Can\'t find deployment on network ' + networkId)
        const contractAddress = artifactNetwork.address
        theContract = new ethers.Contract(
            contractAddress, contractABI, provider.getSigner())

        await listenToEvents()
        return {contractAddress, network}
  }

  async function contractCall() {
    await window.ethereum.send('eth_requestAccounts')

    const txOptions = {gasPrice: await provider.getGasPrice()}
    const transaction = await theContract.captureTheFlag(txOptions)
    const hash = transaction.hash
    console.log(`Transaction ${hash} sent`)
    const receipt = await transaction.wait()
    console.log(`Mined in block: ${receipt.blockNumber}`)
}

let logview

function log(message) {
    message = message.replace(/(0x\w\w\w\w)\w*(\w\w\w\w)\b/g, '<b>$1...$2</b>')
    if (!logview) {
        logview = document.getElementById('logview')
    }
    logview.innerHTML = message + "<br>\n" + logview.innerHTML
}

async function listenToEvents() {

    theContract.on('FlagCaptured', (previousHolder, currentHolder, rawEvent) => {
        log(`Flag Captured from&nbsp;${previousHolder} by&nbsp;${currentHolder}`)
        console.log(`Flag Captured from ${previousHolder} by ${currentHolder}`)
    })
}

  useEffect(()=>{
    loadBlockchainData();  
  },[])

  return(
    <div>
      <button onClick={contractCall}>Hey how are you</button>
    </div> 
  );
}

export default App;
