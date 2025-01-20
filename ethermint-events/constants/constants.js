const RPC_URL = process.env.RPC_URL;
const WS_URL = process.env.WS_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const MNEMONIC =
  "stumble tilt business detect father ticket major inner awake jeans name vibrant tribe pause crunch sad wine muscle hidden pumpkin inject segment rocket silver";

let LAYER_NUMBER = process.env.LAYER_NUMBER;
const UPPER_LAYER_INCOMING = process.env.UPPER_LAYER_INCOMING; //FABRIC-TO-ETHERMINT-QUEUE
const UPPER_LAYER_OUTGOING = process.env.UPPER_LAYER_OUTGOING; //ETHERMINT-TO-FABRIC-QUEUE
const LOWER_LAYER_INCOMING = process.env.LOWER_LAYER_INCOMING;
const LOWER_LAYER_OUTGOING = process.env.LOWER_LAYER_OUTGOING;
const RABBITMQ_HOST = `amqp://guest:guest@host.docker.internal:5672`;


module.exports = {
  RPC_URL,
  WS_URL,
  CONTRACT_ADDRESS,
  MNEMONIC,
  LAYER_NUMBER,
  RABBITMQ_HOST,
  UPPER_LAYER_INCOMING,
  UPPER_LAYER_OUTGOING,
  LOWER_LAYER_INCOMING,
  LOWER_LAYER_OUTGOING
};
