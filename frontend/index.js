import { CustomEvent } from './event.js';
import { WebSocketManager } from './manager.js'

// Detect if websockets supported
window.onload = function() {
  if (!window["WebSocket"]) {
    alert("Websockets not supported!")
  }
}

// Resize canvas accoring to window size
window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
resizeCanvas();

// Connect to server
const wsManager = new WebSocketManager("ws://localhost:8080/ws", ctx);

// Send create party event when the create button is clicked
var createButton = document.getElementById("create-button");
createButton.onclick = () => {
  const createParty = new CustomEvent("CREATE_PARTY", null);
  wsManager.send(createParty);
}

// Send join party event when the join button is clicked
var joinButton = document.getElementById("join-button");
var partyIDInput = document.getElementById("partyid-input")
joinButton.onclick = () => {
  var partyID = partyIDInput.value;
  if (partyID.trim() !== "") {
    const joinParty = new CustomEvent("JOIN_PARTY", {partyID: partyID});
    wsManager.send(joinParty);
  } else {
    console.log("Please enter a party id!")
  }
}