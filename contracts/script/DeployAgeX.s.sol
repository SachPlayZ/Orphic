// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AgeXGameEngine.sol";

contract DeployAgeX is Script {
    function run() external {
        vm.startBroadcast();

        GamingNFTMarketplace ageXGameEngine = new GamingNFTMarketplace();
        console.log(
            "Deployed AgeXGameEngine at address: ",
            address(ageXGameEngine)
        );
        vm.stopBroadcast();
    }
}
