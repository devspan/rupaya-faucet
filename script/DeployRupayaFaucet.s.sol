// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/RupayaFaucet.sol";

contract DeployRupayaFaucet is Script {
    RupayaFaucet public deployedFaucet;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        deployedFaucet = new RupayaFaucet(deployerAddress);
        
        // Fund the faucet with 10 RUPX (adjust as needed)
        uint256 fundAmount = 10 ether;
        if (address(deployerAddress).balance >= fundAmount) {
            payable(address(deployedFaucet)).transfer(fundAmount);
        } else {
            console.log("Warning: Deployer doesn't have enough funds to initialize the faucet");
        }

        vm.stopBroadcast();

        console.log("RupayaFaucet deployed at:", address(deployedFaucet));
        console.log("Deployed by:", deployerAddress);
        console.log("Initial faucet balance:", address(deployedFaucet).balance);
    }
}