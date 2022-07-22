import Tijori from '../abis/tijori.json'
import React, { Component,useState } from "react";
import{create} from 'ipfs-http-client'
import Navbar from './Navbar'
import Main from './Main'
import './App.css';
import Web3 from "web3/dist/web3.min";

const ipfs= create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })




class App extends Component {

  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  
    async loadWeb3() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      }
      else {
        window.alert('install MetaMask')
      }
    }
  
    async loadBlockchainData() {
      const web3 = window.web3
      // Load account
      const accounts = await web3.eth.getAccounts()
      this.setState({ account: accounts[0] })
      // Network ID
      const networkId = await web3.eth.net.getId()
      const networkData = Tijori.networks[networkId]
      if(networkData) {
        // Assign contract
        const tijori = new web3.eth.Contract(Tijori.abi, networkData.address)
        this.state.tijori= tijori
        
        // Get files amount
        const filesCount = await tijori.methods.fileCount().call()
        this.state.filesCount=filesCount
        // Load files&sort by the newest
        for (var i = filesCount; i >= 1; i--) {
          const file = await tijori.methods.files(i).call()
          this.setState({
            files: [...this.state.files, file]
          })
         
        }
        
      } else {
        window.alert('Tijori contract not deployed to detected network.')
      }
    }
  
    // Get file from user
    captureFile = event => {
      event.preventDefault()
  
      const file = event.target.files[0]
      const reader = new window.FileReader()
  
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        this.state.Buffer= new Uint8Array(reader.result)
        this.state.type= file.type
        this.state.name=file.name
        console.log('buffer', this.state.Buffer)
      }
    }

    uploadFile = async(description) => {
      console.log("Submitting file to IPFS...")

      // if(this.state.Buffer){
        let hash;
        let file = await ipfs.add(this.state.Buffer).then(result=>{
          hash= result.path
          console.log("AAAAA",result)
        //Assign value for the file without extension
        if(this.state.type === ''){
          this.setState({type: 'none'})
        }

        this.state.loading= true
        
        this.state.tijori.methods.uploadFile(result.path, result.size, this.state.type, this.state.name, description).send({ from: this.state.account })
        .on('transactionHash', (hash) => {
          this.setState({
           loading: false,
           type: null,
           name: null
         })
         window.location.reload()
        }).on('error',(e)=>{
          window.alert("ERROR IN STORING")
          this.state.loading=false
          window.location.reload()
        })

      }).on('error',(e)=>{
        window.alert("ERROR IN UPLOADING")
        this.state.loading=false
        window.location.reload()
      })
      // }

      // else{
      //   window.alert("OOPS")
      //   window.location.reload()
      // }

      window.location.reload()
    }  
        
    constructor(props) {
      super(props)
      this.state = {
        account: '',
        dstorage: null,
        files: [],
        loading: false,
        type: null,
        Buffer:null,
        name: null
      }
      this.uploadFile = this.uploadFile.bind(this)
      this.captureFile = this.captureFile.bind(this)
    }
    
    render() {
      return (
        
        <div>
          <Navbar account={this.state.account} />
          { this.state.loading
            ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
            : <Main
                files={this.state.files}
                captureFile={this.captureFile}
                uploadFile={this.uploadFile}
                account={this.state.account}
              />
          }
        </div>
      );
    }
}

export default App;



// FileUpload Component : Uploads a Single File to IPFS and returns the URL


// const App = () => {
//   const [fileUrl, setFileUrl] = useState("");

//   return (
//     <div>
//       <FileUpload setUrl={setFileUrl} />
//       FileUrl :{" "}
//       <a href={fileUrl} target="_blank" rel="noopener noreferrer">
//         {fileUrl}
//       </a>
//     </div>
//   );
// };

// export default App;
