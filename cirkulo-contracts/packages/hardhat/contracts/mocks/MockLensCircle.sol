// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockLensCircle
 * @notice Mock contract to simulate a Lens.xyz circle contract for testing
 */
contract MockLensCircle {
    string public name;
    address public owner;

    constructor(string memory _name, address _owner) {
        name = _name;
        owner = _owner;
    }

    function getCircleName() external view returns (string memory) {
        return name;
    }
}
