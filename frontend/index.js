import { Event } from './event.js';

// Detect if websockets supported
window.onload = function() {
  if (!window["WebSocket"]) {
    alert("Websockets not supported!")
  }
}

var createButton = document.getElementById("create-button");
createButton.onclick = () => {
  let socket = new WebSocket("ws://localhost:8080/ws")

  socket.onopen = () => {
    console.log("WebSocket connection established.");
    const createParty = new Event("CREATE_PARTY", "PAYLOAD");
    // USE MANAGER TO SEND THIS LATER
    console.log(JSON.stringify(createParty));
    socket.send(JSON.stringify(createParty));
  }
}

