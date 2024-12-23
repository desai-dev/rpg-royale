import { CustomEvent } from './event.js';
import { WebSocketManager } from './manager.js'
import { settings } from './settings.js'

// Detect if websockets supported
window.onload = function() {
  if (!window["WebSocket"]) {
    alert("Websockets not supported!")
  }
}


const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Connect to server
const wsManager = new WebSocketManager("ws://localhost:8080/ws", ctx);
const gameManager = wsManager.gameManager;

// Resize canvas according to window size
const nativeWidth = settings.game.nativeWidth;   // Dimensions that the canvas 
const nativeHeight = settings.game.nativeHeight; // will be optimized for

window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
  var deviceWidth = window.innerWidth; 
  var deviceHeight = window.innerHeight;
  
  var scaleFitNative = Math.min(deviceWidth / nativeWidth, deviceHeight / nativeHeight);

  // Dimensions of the tile map
  const tileSize = settings.map.tileSize; 
  const mapColumns = settings.map.mapColumns;
  const mapRows = settings.map.mapRows; 
  const mapWidth = tileSize * mapColumns;
  const mapHeight = tileSize * mapRows;

  // Centers of the map and the canvas
  const mapCenterX = mapWidth / 2;
  const mapCenterY = mapHeight / 2;
  const canvasCenterX = deviceWidth / 2;
  const canvasCenterY = deviceHeight / 2;
  
  canvas.style.width = deviceWidth + "px";
  canvas.style.height = deviceHeight + "px";
  canvas.width = deviceWidth;
  canvas.height = deviceHeight;
  
  if (scaleFitNative < 1) {
    ctx.imageSmoothingEnabled = true;
  } else{
    ctx.imageSmoothingEnabled = false; 
  }
  
  // Transformation to center the canvas
  ctx.setTransform(
    scaleFitNative,0,
    0,scaleFitNative,
    canvasCenterX - mapCenterX * scaleFitNative,
    canvasCenterY - mapCenterY * scaleFitNative 
  );

  gameManager.updateGameDimensions(canvasCenterX, canvasCenterY, mapCenterX, mapCenterY, scaleFitNative)
}
resizeCanvas();

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