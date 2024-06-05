// Detect if websockets supported
window.onload = function() {
  if (!window["WebSocket"]) {
    alert("Websockets not supported!")
  }
}

// MAKE A MODULAR SYSTEM FOR THIS LATER (a manger for the frontend)
let socket = new WebSocket("ws://localhost:8080/ws")
console.log("Attempting connection")

socket.onopen = () => {
  console.log("Connected!")
  socket.send("Hi from the client!");
}

socket.onclose = () => {
  console.log("Connection closed!");
}

socket.onmessage = (msg) => {
  console.log(msg);
}

var createButton = document.getElementById("create-button");
createButton.onclick = () => {
  socket.send("Creating... !");
}

