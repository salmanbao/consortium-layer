const { aevmos } = require("../chain/chain.js");
const { RPC_URL, CONTRACT_ADDRESS,LAYER_NUMBER } = require("../constants/constants.js");
const { createPublicClient, webSocket, parseAbi, parseEventLogs, http } = require("viem");
const abi = require("../abis/abi.json");
const { loadContract } = require("../utils/contract.js");
const {
  handleEthermintToFabricEvent,
  handleEthermintUpperToEthermintLowerEvent,
} = require("../messageQueue/producer.js");

// Create a public client using WebSocket transport for real-time updates.
const client = createPublicClient({
  chain: aevmos,
  transport: http(RPC_URL),
});

// Global variable to hold events (if you prefer a reactive approach, consider an event emitter).
let events = [];

/**
 * Watches for blocks and parses events.
 * In this version, we uncomment the event filters and use the ABI & contract address.
 */
async function watchEvents() {
  // Define the events you want to listen for.
  const dataSubmittedEvent = "event DataSubmitted(string indexed IndexedDataID, string dataID, string deviceID, string dataHash, uint timestamp)";
  const dataValidatedEvent = "event DataValidated(string indexed IndexedDataID, string dataID, string status, uint updatedTimestamp)";

  // Parse ABI events.
  const eventsAbi = parseAbi([
    dataSubmittedEvent,
    dataValidatedEvent,
  ]);

  console.log("Starting block watch using WebSocket transport...");

  const unwatch = client.watchBlocks({
    // Note: when using watchBlocks for event parsing, you might instead use watchContractEvents
    // if your version of viem supports that method. For now, we use onBlock callback
    emitOnBegin: true,
    onBlock: async (block) => {
      console.log("New block:", block.number);
      
      // Optionally, query contract logs within this block.
      // (For better control, use client.getLogs with filters)
      // Example: retrieving logs for our contract in the current block:
      try {
        const logs = await client.getLogs();
        console.log(`Received ${logs.length} logs in block ${block.number}`);
        if (logs && logs.length > 0) {
          // Parse events from the logs using the ABI.
          const parsedEvents = parseEventLogs({ abi: eventsAbi, logs });
          if (parsedEvents.length) {
            parsedEvents.forEach(event => {
              console.log(`Received event ${event.eventName}:`, event.args);
              events.push(event);
            });
          }
        }
      } catch (logErr) {
        console.error("Error fetching/parsing logs:", logErr);
      }
    },
    onError: (error) => {
      console.error("Block watch error:", error);
      // Unwatch and try to restart the subscription if needed.
      unwatch();
      // Optionally, implement a reconnection strategy here.
    },
  });
  return unwatch;
}

let unwatch;
async function main() {
  try {
    // Start watching blockchain events
    unwatch = await watchEvents();
    console.log("Started watching events");

    const contract = loadContract();
    console.log("Smart Contract Address:", CONTRACT_ADDRESS);

    // Instead of using a busy loop, use periodic checks (or event-driven approach).
    setInterval(async () => {
      if (events.length > 0) {
        const event = events.shift(); // process the first event
        console.log(`Processing event: ${event.eventName} from contract ${CONTRACT_ADDRESS}`);

        if (event.eventName === "DataSubmitted") {
          // For example, if LAYER_NUMBER is defined and equals 3:
          if (LAYER_NUMBER == 3) {
            console.log("Reached Layer 3, validating data");
            const hash = await contract.write.validateData([event.args.dataID]);
            console.log("Data Validated Hash:", hash);
          } else {
            await handleEthermintUpperToEthermintLowerEvent({...event.args,timestamp:parseInt(event.args.timestamp)});
          }
        } else if (event.eventName === "DataValidated") {
          await handleEthermintToFabricEvent({
            dataID: event.args.dataID,
            isValid: true,
          });
        }
      }
    }, 500); // Check every second
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
