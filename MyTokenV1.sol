// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract MyTokenV1 is ERC20Upgradeable, UUPSUpgradeable, AccessControlUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    struct MyTokenStorage {
        string label;
    }

    bytes32 private constant MyTokenStorageLocation =
        0x3973cbf7729f31e4bb045302058bce9b04e6b67a95624ef2348e83dd6ad6bbdd;

    function _getMyTokenStorage() internal pure returns (MyTokenStorage storage $) {
        assembly {
            $.slot := MyTokenStorageLocation
        }
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name_, string memory symbol_, address admin) public initializer {
        if (admin == address(0)) revert();
        __ERC20_init(name_, symbol_);
        __UUPSUpgradeable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        _setRoleAdmin(UPGRADER_ROLE, DEFAULT_ADMIN_ROLE);

        _setLabel("v1");
    }

    function version() external pure virtual returns (string memory) {
        return "v1";
    }

    function myTokenLabel() public view returns (string memory) {
        MyTokenStorage storage $ = _getMyTokenStorage();
        return $.label;
    }

    function _setLabel(string memory newLabel) internal {
        MyTokenStorage storage $ = _getMyTokenStorage();
        $.label = newLabel;
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}
}
