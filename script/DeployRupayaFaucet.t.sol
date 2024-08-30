// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../script/DeployRupayaFaucet.s.sol";
import "../src/RupayaFaucet.sol";

contract DeployRupayaFaucetTest is Test {
    DeployRupayaFaucet public deployScript;
    address public deployer;
    uint256 public constant DEPLOYER_PRIVATE_KEY = 0x1234;

    function setUp() public {
        deployScript = new DeployRupayaFaucet();
        deployer = vm.addr(DEPLOYER_PRIVATE_KEY);
        vm.label(deployer, "deployer");
        vm.deal(deployer, 100 ether);
    }

    function testDeploymentScript() public {
        // Set up the environment variable
        vm.setEnv("PRIVATE_KEY", vm.toString(DEPLOYER_PRIVATE_KEY));

        // Run the deployment script
        deployScript.run();

        // Verify the deployment
        RupayaFaucet deployedFaucet = deployScript.deployedFaucet();

        assertEq(deployedFaucet.owner(), deployer);
        assertEq(address(deployedFaucet).balance, 10 ether);
    }
}