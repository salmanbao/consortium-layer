import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.0",

  networks: {
    ethermint: {
      url: `${process.env.RPC_URL}`,
      // url: `http://localhost:8545`,
      chainId: 9000,
      accounts: {
        mnemonic:"stumble tilt business detect father ticket major inner awake jeans name vibrant tribe pause crunch sad wine muscle hidden pumpkin inject segment rocket silver"
      },
    },
  },
  ignition: {
    strategyConfig: {
      create2: {
        // To learn more about salts, see the CreateX documentation
        salt: "0x0000000000000000000000000000000000000000000000000000000000000123",
      },
    },
    requiredConfirmations: 1,
  },

};

export default config;
