// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MonsterMarket} from "../src/MonsterMarket.sol";

contract DeployMonsterMarket is Script {
    function run() external returns (MonsterMarket) {
        vm.startBroadcast();
        MonsterMarket monsterMarket = new MonsterMarket();

        vm.stopBroadcast();

        return (monsterMarket);
    }
}
