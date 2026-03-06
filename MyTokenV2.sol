// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MyTokenV1.sol";

contract MyTokenV2 is MyTokenV1 {
    function initializeV2(string memory newLabel) public reinitializer(2) {
        _setLabel(newLabel);
    }

    function setMyTokenLabel(string memory newLabel) external onlyRole(UPGRADER_ROLE) {
        _setLabel(newLabel);
    }

    function version() external pure override returns (string memory) {
        return "v2";
    }
}
