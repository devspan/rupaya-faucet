// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/RupayaFaucet.sol";

contract RupayaFaucetTest is Test {
    RupayaFaucet public faucet;
    address public owner;
    address public user1;
    address public user2;

    event FaucetClaim(address indexed claimant, uint256 amount);

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        faucet = new RupayaFaucet(owner);
        vm.deal(address(faucet), 100 ether); // Fund the faucet
    }

    function testInitialState() public {
        assertEq(faucet.owner(), owner);
        assertEq(address(faucet).balance, 100 ether);
    }

    function testClaimTokens() public {
        vm.warp(block.timestamp + faucet.FAUCET_COOLDOWN() + 1);
        vm.prank(user1);
        uint256 initialBalance = user1.balance;
        faucet.claimTokens();
        assertEq(user1.balance, initialBalance + 0.1 ether);
        assertEq(faucet.lastClaimTime(user1), block.timestamp);
    }

    function testClaimCooldown() public {
        vm.startPrank(user1);
        vm.warp(block.timestamp + faucet.FAUCET_COOLDOWN() + 1);
        faucet.claimTokens();
        vm.expectRevert("Cooldown period not elapsed");
        faucet.claimTokens();
        vm.stopPrank();
    }

    function testClaimAfterCooldown() public {
        vm.startPrank(user1);
        vm.warp(block.timestamp + faucet.FAUCET_COOLDOWN() + 1);
        faucet.claimTokens();
        vm.warp(block.timestamp + faucet.FAUCET_COOLDOWN() + 1);
        faucet.claimTokens();
        assertEq(user1.balance, 0.2 ether);
        vm.stopPrank();
    }

    function testInsufficientFaucetBalance() public {
        // Drain the faucet
        vm.prank(owner);
        faucet.withdrawFunds();
        
        vm.warp(block.timestamp + faucet.FAUCET_COOLDOWN() + 1);
        vm.prank(user1);
        vm.expectRevert("Insufficient faucet balance");
        faucet.claimTokens();
    }

    function testWithdrawFunds() public {
        uint256 initialBalance = address(this).balance;
        faucet.withdrawFunds();
        assertEq(address(this).balance, initialBalance + 100 ether);
        assertEq(address(faucet).balance, 0);
    }

    function testWithdrawFundsNonOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        faucet.withdrawFunds();
    }

    function testWithdrawFundsEmptyFaucet() public {
        // First withdraw all funds
        faucet.withdrawFunds();
        
        // Try to withdraw again
        vm.expectRevert("No funds to withdraw");
        faucet.withdrawFunds();
    }

    function testReceiveFunction() public {
        payable(address(faucet)).transfer(1 ether);
        assertEq(address(faucet).balance, 101 ether);
    }

    function testFaucetClaimEvent() public {
        vm.warp(block.timestamp + faucet.FAUCET_COOLDOWN() + 1);
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit FaucetClaim(user1, 0.1 ether);
        faucet.claimTokens();
    }

    // Add this function to make the contract payable
    receive() external payable {}
}