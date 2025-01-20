const { defineChain } = require("viem");
const { RPC_URL, WS_URL } = require("../constants/constants");
const aevmos = defineChain({
    id: 9000,
    name: "aevmos",
    nativeCurrency: {
      decimals: 18,
      name: "aevmos",
      symbol: "aevmos",
    },
    rpcUrls: {
      default: {
        http: [RPC_URL],
        webSocket: [WS_URL],
      },
    },
    blockExplorers: {
      // ignore this because we are not gonna use this
      default: { name: "Explorer", url: "https://explorer.zora.energy" },
    },
    contracts: {
      // ignore this because we are not gonna use this
      multicall3: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11",
        blockCreated: 5882,
      },
    },
  });

  module.exports = {
    aevmos
  };