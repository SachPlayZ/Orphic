// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {OrphicGameEngine} from "../src/OrphicGameEngine.sol";

contract DeployOrphicGameEngine is Script {
    function run() public returns (OrphicGameEngine) {
        vm.startBroadcast();
        OrphicGameEngine orphicGameEngine = new OrphicGameEngine();
        vm.stopBroadcast();
        return orphicGameEngine;
    }
}
