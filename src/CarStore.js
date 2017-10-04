/**
 * @file: CarStore.js
 * @author: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 * Date: 02.10.2017
 * Last Modified Date: 04.10.2017
 * Last Modified By: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 */

import DMRJson from '../build/contracts/DMR.json'
import VehicleJson from '../build/contracts/Vehicle.json'
import TokenJson from '../build/contracts/HumanStandardToken.json'
import utils from './utils/contracts.js'

let TokenContract = utils.initiateContract(TokenJson);
let VehicleContract = utils.initiateContract(VehicleJson);
let DMRContract = utils.initiateContract(DMRJson);
let getDeployed = contract => contract.then(i => i.deployed())
let getSpecific = (contract, address) => contract.then(i => i.at(address))
let getAddress = contract => getDeployed(contract).then(i => i.address)
let getAccount = () => utils.getAccounts().then(accounts => accounts[0]);


export class Token {

    balance() {
        return getDeployed(TokenContract)
            .then(instance => getAccount().then(account => instance.balanceOf(account)))
            .then(r => r.toNumber())
    }

    checkAllowance() {
        return getDeployed(TokenContract).then(instance => Promise.all([
            getAccount(),
            getAddress(DMRContract)
        ]).then(r => instance.allowance(r[0], r[1]))
            .then(r => r.toNumber())
        );
    }

    setAllowance(amount) {
        return getDeployed(TokenContract).then(instance => Promise.all([
            getAddress(DMRContract),
            getAccount()
        ]).then(r => instance.approve(r[0], amount, {from: r[1] })))
    }

    tokenSymbol = getDeployed(TokenContract).then(instance => instance.symbol.call())

}

export class DMR {

    revokeOffer(address) {
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].revokeOffer(address, { from: r[1] }))
    }

    acceptOffer(address) {
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].acceptOffer(address, { from: r[1] }))
    }

    completeTransaction(address) {
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].completeTransaction(address, { from: r[1] }))
    }

    abortTransaction(address) {
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].abortTransaction(address, { from: r[1] }))
    }

    isVinRegistered(vin) {
        return getDeployed(DMRContract).then(instance => instance.isVinregistered(vin));
    }

    isVinValid(vin){

        const transliterate = c => '0123456789.ABCDEFGH..JKLMN.P.R..STUVWXYZ'.indexOf(c) % 10;

        const get_check_digit = vin => {
            var map = '0123456789X';
            var weights = '8765432X098765432';
            var sum = 0;
            for (var i = 0; i < 17; ++i)
                sum += transliterate(vin[i]) * map.indexOf(weights[i]);
            return map[sum % 11];
        }

        const validate = vin => vin.length !== 17 ? false : get_check_digit(vin) === vin[8];

        return validate(vin);
    }

    getOwnVehicles(){
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].getVehiclesOwnedBy(r[1]))
    }

    getOfferedVehicles(){
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].getItemsOfferedTo(r[1]))
    }

    extendOffer(address, buyer, amount){
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].extendOffer(address, buyer, amount, { from: r[1] } ));
    }

    issueVehicle(vin, model, brand, year, color){
        return Promise.all([
            getDeployed(DMRContract),
            getAccount()
        ]).then(r => r[0].issueVehicle(vin, brand, model, year, color, { from: r[1] }))
        .catch(err => console.log(err))
    }
}

let vehicles = {}

export class Vehicle {

    constructor(address){

        if(vehicles[address] != null) return vehicles[address];

        console.log("Making new vehicle");

        this.address = address
        this.fetch()
        this.subscribers = {};

        vehicles[address] = this;

    }

    fetch(){

        let resolveState = i => {
            if(i === 1) return 'extended';
            if(i === 2) return 'accepted';
            return 'initial';
        }

        getSpecific(VehicleContract, this.address).then(instance => 
            Promise.all([
                instance.vin.call().then(v => this.vin = v),
                instance.owner.call().then(v => this.owner = v),
                instance.brand.call().then(v => this.brand = v),
                instance.model.call().then(v => this.model = v),
                instance.year.call().then(v => this.year = v),
                instance.color.call().then(v => this.color = v)
            ]).then(() => this.notify())
        );

        getDeployed(DMRContract).then(instance => instance.offers.call(this.address))
            .then(offer => {
                this.buyer = offer[1]
                this.amount = offer[2].toNumber()
                this.state = resolveState(offer[3].toNumber())
            }).then(() => this.notify())
    }

    isMarketAuthorized(){
        return Promise.all([
            getSpecific(VehicleContract, this.address),
            getAddress(DMRContract)
        ]).then(r => r[0].isAuthorizedToSell(r[1]))
    }

    authorizeMarket(){
        return Promise.all([
            getSpecific(VehicleContract, this.address),
            getAddress(DMRContract),
            getAccount()
        ]).then(r => r[0].authorizeSeller(r[1], { from: r[2] } ))
    }


    subscribe(caller, callback){ this.subscribers[caller] = callback; }
    unsubscribe(caller){ this.subscribers.remove(caller); }
    notify() { for(var key in this.subscribers){ this.subscribers[key](this) } }

    equals(vehicle){

        if(vehicle == null) return false;
        if(vehicle.vin != this.vin) return false;
        if(vehicle.buyer != this.buyer) return false;
        if(vehicle.amount != this.amount) return false;
        if(vehicle.state != this.state) return false;
        return true;
    }

}

export default { Token, DMR, Vehicle }
