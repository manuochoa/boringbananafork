const Web3 = require("web3");
const ABI = require("./newAbi.json");
const fs = require("fs");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const buildDir = `${basePath}/result`;

let contractEvents = [];
let filteredEvents = [];

const events = async () => {
  let provider =
    "https://rinkeby.infura.io/v3/a8ed213665484d9eba057b5ee327f8e0";
  const web3 = new Web3(provider);
  let contract = new web3.eth.Contract(
    ABI.abi,
    "0x847Bfefc478912aBf3AB060ec8556F7ddccBd45A"
  );
  let result = await contract.getPastEvents("traitChoosed", {
    fromBlock: 0,
    toBlock: "latest",
  });

  contractEvents = result;
  writeEvents(JSON.stringify(contractEvents, null, 2));
  console.log(result);
  filterEvents();
};

const filterEvents = () => {
  if (contractEvents.length === 0) {
    events();
  }
  contractEvents.map((e) => {
    filteredEvents.push(e.returnValues);
  });
  writeFilterEvents(JSON.stringify(filteredEvents, null, 2));
};

const writeEvents = (_data) => {
  fs.writeFileSync(`${buildDir}/events.json`, _data);
};
const writeFilterEvents = (_data) => {
  fs.writeFileSync(`${buildDir}/filterEvents.json`, _data);
};

events();
