// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract RupayaFaucet is ReentrancyGuard, Ownable {
    using Address for address payable;

    uint256 public constant FAUCET_AMOUNT = 0.1 ether;
    uint256 public constant FAUCET_COOLDOWN = 12 hours;

    mapping(address => uint256) public lastClaimTime;

    event FaucetClaim(address indexed claimant, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    receive() external payable {}

    function claimTokens() external nonReentrant {
        require(block.timestamp > lastClaimTime[msg.sender] + FAUCET_COOLDOWN, "Cooldown period not elapsed");
        require(address(this).balance >= FAUCET_AMOUNT, "Insufficient faucet balance");

        lastClaimTime[msg.sender] = block.timestamp;
        
        payable(msg.sender).sendValue(FAUCET_AMOUNT);

        emit FaucetClaim(msg.sender, FAUCET_AMOUNT);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        payable(owner()).sendValue(balance);
    }
}