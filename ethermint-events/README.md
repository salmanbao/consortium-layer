# Ethermint Events

This repository contains the code for watching and executing events in a testnet of Ethermint.

## Directory Structure

The directory structure of this repository is as follows:

- `chain/`: contains the chain configuration for Ethermint
- `constants/`: contains constants used throughout the codebase
- `modules/`: contains the code for watching and executing events
- `utils/`: contains utility functions used throughout the codebase
- `abis/`: contains the ABI for the contract used in the codebase
- `package.json`: contains metadata for the project
- `README.md`: this file

## Purpose of Each File

The purpose of each file is as follows:

- `chain/chain.js`: defines the Ethermint chain configuration
- `constants/constants.js`: defines constants used throughout the codebase
- `modules/tx-executor.js`: contains the code for executing events
- `modules/watch-events.js`: contains the code for watching events
- `utils/generateTxs.js`: contains utility functions for generating dummy transactions
- `abis/abi.json`: contains the ABI for the contract used in the codebase
- `package.json`: contains metadata for the project
- `README.md`: this file, which describes the purpose and directory structure of the repository


## How to Install Dependencies and Run the Code

To install the dependencies and run the code, do the following:

1. Clone the repository and navigate to the cloned directory
2. Run `npm install` to install the dependencies
3. Run `npm run watchEvents` to watch for events
4. Run `npm run executeTx` to execute transactions
