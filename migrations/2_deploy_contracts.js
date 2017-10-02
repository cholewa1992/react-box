/**
 * @file: migrations/2_deploy_contracts.js
 * @author: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 * Date: 02.10.2017
 * Last Modified Date: 02.10.2017
 * Last Modified By: Jacob Benjamin Cholewa <jacob@cholewa.dk>
 */
var SimpleStorage = artifacts.require("./SimpleStorage.sol");

var HumanStandardToken = artifacts.require("./HumanStandardToken.sol");
var DMR = artifacts.require("./DMR.sol");

module.exports = function(deployer) {

    deployer.deploy(SimpleStorage); //Should be removed at some point

    deployer.deploy(HumanStandardToken, 1000000, "Danske Kroner", 0, "DKK").then(function() {
        return deployer.deploy(DMR, HumanStandardToken.address);
    });
};
