/**
 * @file: contracts.js
 * @author: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 * Date: 02.10.2017
 * Last Modified Date: 02.10.2017
 * Last Modified By: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 */


import getWeb3 from './getWeb3'
import Web3 from 'web3'


let contractUtils = {

    initiateContract: function(json){
        return new Promise(function(resolve,reject){

            getWeb3.then(results => {

                const contract = require('truffle-contract')
                const instance = contract(json)
                instance.setProvider(results.web3.currentProvider)
                resolve(instance)

            }).catch(() => {

                reject('Error finding web3.');
                console.log('Error finding web3.')

            })
        });
    },


    isChecksumAddress: address => {
        // Check each case
        address = address.replace('0x','');
        var addressHash = Web3.sha3(address.toLowerCase());
        for (var i = 0; i < 40; i++ ) {
            // the nth letter should be uppercase if the nth digit of casemap is 1
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                return false;
            }
        }
        return true;
    },

    isAddress: address => {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            // check if it has the basic requirements of an address
            return false;
        } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
            // If it's all small caps or all all caps, return true
            return true;
        } else {
            // Otherwise check each case
            return this.isChecksumAddress(address);
        }
    },

    getAccounts: () => new Promise((resolve, reject) => 
    getWeb3.then(results => results.web3.eth.getAccounts((error, accounts) => resolve(accounts))))


}

export default contractUtils 
