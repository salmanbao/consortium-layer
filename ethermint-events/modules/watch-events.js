const { CONTRACT_ADDRESS, LAYER_NUMBER } = require("../constants/constants.js");
const { parseAbi, parseEventLogs } = require("viem");
const {
  loadContract,
  publicClient,
} = require("../utils/contract.js");
const {
  handleEthermintToFabricEvent,
  handleEthermintUpperToEthermintLowerEvent,
} = require("../messageQueue/producer.js");

// An array (or queue) to store event objects for processing
let events = [];

/**
 * watchEvents - Watches for new blocks and parses logs into events.
 */
async function watchEvents() {
  // Define the events you want to parse
  const dataSubmittedEvent = "event DataSubmitted(string indexed IndexedDataID, string dataID, string deviceID, string dataHash, uint timestamp)";
  const dataValidatedEvent = "event DataValidated(string indexed IndexedDataID, string dataID, string status, uint updatedTimestamp)";

  const eventsAbi = parseAbi([
    dataSubmittedEvent,
    dataValidatedEvent,
  ]);

  console.log("Starting block watch...");

  const unwatch = publicClient.watchBlocks({
    emitOnBegin: true,
    onBlock: async (block) => {
      console.log("New block:", block.number);
      try {
        // For a real scenario, filter logs by address, fromBlock, toBlock, etc.
        const logs = await publicClient.getLogs({
          fromBlock: block.number,
          toBlock: block.number,
          address: CONTRACT_ADDRESS,
        });
        console.log(`Received ${logs.length} logs in block ${block.number}`);

        if (logs.length > 0) {
          const parsedEvents = parseEventLogs({ abi: eventsAbi, logs });
          if (parsedEvents.length) {
            parsedEvents.forEach((ev) => {
              console.log(`Received event ${ev.eventName}:`, ev.args);
              events.push(ev);
            });
          }
        }
      } catch (logErr) {
        console.error("Error fetching/parsing logs:", logErr);
      }
    },
    onError: (error) => {
      console.error("Block watch error:", error);
      // Optionally unwatch and attempt reconnection
      unwatch();
    },
  });
  return unwatch;
}

let unwatch;

async function main() {
  try {
    unwatch = await watchEvents();
    console.log("Started watching events");

    // (Optional) loadContract for reading, but we’ll rely on walletClient for sending tx
    const contract = loadContract();
    console.log("Smart Contract Address:", CONTRACT_ADDRESS);


    // 2. Process new events every 500ms
    setInterval(async () => {
      if (events.length > 0) {
        const event = events.shift();
        console.log(`Processing event: ${event.eventName}`);

        if (event.eventName === "DataSubmitted") {
          if (LAYER_NUMBER == 1) {
            console.log("Reached Layer 1, validating data...");

            try {
              const txHash = await contract.write.validateData(
                [event.args.dataID],
              );
  
              console.log(`Data Validated TxHash: ${txHash}`);
            } catch (error) {
              console.error("Error validating data:", error);
            }
            

          } else {
            // If not LAYER_NUMBER 1
            await handleEthermintUpperToEthermintLowerEvent({
              ...event.args,
              timestamp: parseInt(event.args.timestamp),
            });
          }
        } else if (event.eventName === "DataValidated") {
          await handleEthermintToFabricEvent({
            dataID: event.args.dataID,
            isValid: true,
          });
        }
      }
    }, 500);
  } catch (error) {
    console.error("Error in main:", error);
    if (unwatch) unwatch();
  }
}

main().catch(console.error);

process.on("SIGINT", async () => {
  console.log("Caught interrupt signal");
  if (unwatch) {
    await unwatch();
    console.log("Stopped watching events");
  }
  process.exit();
});
