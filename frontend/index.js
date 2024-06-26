import { Event } from './event.js';
import { WebSocketManager } from './manager.js'

// Detect if websockets supported
window.onload = function() {
  if (!window["WebSocket"]) {
    alert("Websockets not supported!")
  }
}

// Connect to server
const wsManager = new WebSocketManager("ws://localhost:8080/ws");

// Send create party event when the create button is clicked
var createButton = document.getElementById("create-button");
createButton.onclick = () => {
  const createParty = new Event("CREATE_PARTY", null);
  wsManager.send(createParty);
}

// Send join party event when the join button is clicked
var joinButton = document.getElementById("join-button");
var partyIDInput = document.getElementById("partyid-input")
joinButton.onclick = () => {
  var partyID = partyIDInput.value;
  if (partyID.trim() !== "") {
    const joinParty = new Event("JOIN_PARTY", {partyID: partyID});
    wsManager.send(joinParty);
  } else {
    console.log("Please enter a party id!")
  }
}