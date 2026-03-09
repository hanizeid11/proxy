# MyToken Contracts Documentation

## Overview

`MyTokenV1` and `MyTokenV2` are upgradeable ERC20 contracts using:
- OpenZeppelin `ERC20Upgradeable`
- UUPS proxy upgrade pattern (`UUPSUpgradeable`)
- Role-based permissions (`AccessControlUpgradeable`)

`MyTokenV2` extends `MyTokenV1` and adds V2-specific initialization and label update functionality.

---

## Contract: `MyTokenV1`

### `UPGRADER_ROLE() -> bytes32`
- Type: `public constant`
- Description: Role required to authorize upgrades and protected label updates in V2.

### `_getMyTokenStorage() -> MyTokenStorage storage`
- Visibility: `internal`
- Mutability: `pure`
- Description: Returns a pointer to namespaced custom storage used by this contract family.
- Notes: Uses a fixed storage slot (`MyTokenStorageLocation`) for upgrade-safe storage layout.

### `constructor()`
- Visibility: `public`
- Description: Disables initializers on the implementation contract.
- Notes: Prevents direct initialization of the logic contract outside proxy flow.

### `initialize(string memory name_, string memory symbol_, address admin)`
- Visibility: `public`
- Modifier: `initializer`
- Description: Initializes token metadata, UUPS, access control roles, and default label (`"v1"`).
- Parameters:
  - `name_`: ERC20 token name.
  - `symbol_`: ERC20 token symbol.
  - `admin`: Address granted `DEFAULT_ADMIN_ROLE` and `UPGRADER_ROLE`.
- Reverts:
  - If `admin == address(0)`.

### `version() -> string memory`
- Visibility: `external`
- Mutability: `pure`
- Virtual: `yes`
- Description: Returns implementation version string.
- Returns: `"v1"`.

### `myTokenLabel() -> string memory`
- Visibility: `public`
- Mutability: `view`
- Description: Reads the current custom label from namespaced storage.

### `_setLabel(string memory newLabel)`
- Visibility: `internal`
- Description: Writes a new label into namespaced storage.
- Parameters:
  - `newLabel`: New label value.

### `_authorizeUpgrade(address newImplementation)`
- Visibility: `internal`
- Modifier: `onlyRole(UPGRADER_ROLE)`
- Override: `UUPSUpgradeable`
- Description: Authorization hook required by UUPS for upgrading implementation.
- Parameters:
  - `newImplementation`: Proposed implementation address.

---

## Contract: `MyTokenV2` (inherits `MyTokenV1`)

### `initializeV2(string memory newLabel)`
- Visibility: `public`
- Modifier: `reinitializer(2)`
- Description: V2 initializer to set/update label after upgrading from V1.
- Parameters:
  - `newLabel`: Label value to store.
- Notes:
  - Can run only once for reinitializer version `2`.

### `setMyTokenLabel(string memory newLabel)`
- Visibility: `external`
- Modifier: `onlyRole(UPGRADER_ROLE)`
- Description: Updates token label post-upgrade.
- Parameters:
  - `newLabel`: New label value.

### `version() -> string memory`
- Visibility: `external`
- Mutability: `pure`
- Override: `MyTokenV1.version`
- Description: Returns implementation version string.
- Returns: `"v2"`.

---

## Storage Notes

- `MyTokenV1` defines custom storage as:
  - `struct MyTokenStorage { string label; }`
- Stored at a fixed slot:
  - `MyTokenStorageLocation = 0x3973cbf7729f31e4bb045302058bce9b04e6b67a95624ef2348e83dd6ad6bbdd`
- This pattern keeps storage layout stable across upgrades.
