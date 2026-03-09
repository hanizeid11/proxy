import { defineConfig } from "hardhat/config";
import hardhatIgnitionPlugin from "@nomicfoundation/hardhat-ignition";
import hardhatIgnitionEthers from "@nomicfoundation/hardhat-ignition-ethers";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";
import hardhatChaiMatchers from "@nomicfoundation/hardhat-ethers-chai-matchers";
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
import "dotenv/config";

export default defineConfig({
  plugins: [
    hardhatEthers,
    hardhatIgnitionPlugin,
    hardhatIgnitionEthers,
    hardhatMocha,
    hardhatChaiMatchers,
    hardhatNetworkHelpers,
  ],
  solidity: {
    version: "0.8.24",
  },
  networks: {
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL!,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY!],
    },
  },
});
