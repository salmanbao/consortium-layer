const { mnemonicToAccount } = require("viem/accounts");
const {
  createPublicClient,
  createWalletClient,
  http,
  getContract,
  nonceManager
} = require("viem");
const { aevmos } = require("../chain/chain.js");
const abi = require("../abis/abi.json");
const {
  RPC_URL,
  CONTRACT_ADDRESS,
  MNEMONIC,
} = require("../constants/constants");


// Get the account from the mnemonic
const account = mnemonicToAccount(MNEMONIC,{nonceManager:nonceManager});

// Create public and wallet clients
const publicClient = createPublicClient({
  chain: aevmos,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain: aevmos,
  transport: http(RPC_URL),
  account,
});

function loadContract() {
  // Load the contract
  const contract = getContract({
    address: CONTRACT_ADDRESS,
    abi,
    client: { wallet: walletClient },
  });
  return contract;
}

module.exports = {
  loadContract,
  publicClient,
  walletClient,
};
