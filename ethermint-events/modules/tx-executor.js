
const fs = require("fs");
const {
  generateTransactions,
  saveTransactions,
} = require("../utils/generateTxs.js");
const {loadContract,walletClient,publicClient} = require("../utils/contract.js")

// This file is used to execute the transactions for testing purposes
/**
 * ExecuteTransactions
 *
 * Execute the transactions in the transactions.json file
 */
async function ExecuteTransactions() {
  // Load the contract
  const contract = loadContract()

  // Load the transactions from the JSON file
  const txs = JSON.parse(
    fs.readFileSync(`${__dirname}/transactions.json`, { encoding: "utf-8" })
  );

  // Get the address of the wallet
  const address = await walletClient.getAddresses();

  // // Get the transaction count of the wallet
  let transactionCount = await publicClient.getTransactionCount({
    address: address[0],
  });

  // Execute each transaction
  for (const tx of txs) {
    try {
      console.log([tx.dataID,tx.deviceID, tx.dataHash, BigInt(tx.timestamp)])
      // Submit the data hash
      const submitDataHash = await contract.write.submitIoTData(
        [tx.dataID,tx.deviceID, tx.dataHash, BigInt(tx.timestamp)],
        {
          nonce: BigInt(transactionCount),
        }
      );

      console.log(`Submitted data Hash: ${submitDataHash}`);
      // transactionCount++;
    } catch (error) {
      console.error(`Error submitting data: ${error}`);
    }
  }
}

/**
 * main
 *
 * Generate dummy transactions, save them to a JSON file and execute them
 */
async function main() {
  // Generate dummy transactions
  const transactions = generateTransactions(1);

  // Save the transactions in a JSON file
  await saveTransactions(
    transactions,
    `${__dirname}/transactions.json`
  );

  // Execute the transactions
  await ExecuteTransactions();
}
main().catch(console.error);

