/**
 * @file: App.js
 * @author: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 * Date: 02.10.2017
 * Last Modified Date: 04.10.2017
 * Last Modified By: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 */
import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
import { Token, DMR, Vehicle } from './CarStore'
import VehicleComponent from './Vehicle'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    //new Token().balance().then(amount => console.log(amount))
    //new Token().setAllowance(2000);
    //new Token().checkAllowance().then(amount => console.log(amount))
    //new DMR().issueVehicle("5TETU22N28Z493603", "Audi", "R8", "2017", "Carbon");
    new DMR().getOwnVehicles().then(r => {
        r.forEach(addr => this.setState({vehicle: addr}))
        console.log("got cars");
    });

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(10, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready.</p>
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
              <p>The stored value is: {this.state.storageValue}</p>
                <VehicleComponent value={this.state.vehicle} />
                <VehicleComponent value={this.state.vehicle} />
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
