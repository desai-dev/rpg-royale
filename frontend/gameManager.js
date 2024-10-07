import { CustomEvent } from './event.js';

export class GameManager {
  constructor(wsManager) {
    const canvas = document.getElementById("myCanvas");
    this.canvas = canvas.getContext("2d");
    this.wsManager = wsManager;
    this.modal = document.getElementById('gameModal');
    this.modalOverlay = document.getElementById('modalOverlay');
    this.players = [];
    this.curPlayerId = null;
    this.playerSpeedX = 100;
    this.keys = {}; // Tracks keys that are pressed
    this.lastFrameTime = 0; // Tracks last time a frame was fetched
    this.lastSentTime = 0; // Tracks the last time an event was sent to the server
    this.sendRate = 15; // How many ms between events sent to the server 

    // TODO: Increase sendRate and implement rate limiting

    // Event listeners for key presses
    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false; 
    });
  }

  routeEvent(event) {
    // console.log("WebSocket message received: ", event);
    if (event.type == "GAME_START") {
      this.handleGameStart(event.payload);
    } else if (event.type == "PARTY_CREATED") {
      this.handlePartyCreated(event.payload);
    } else if (event.type == "PLAYER_POSITIONS_UPDATE") {
      this.handlePlayerPositionsUpdate(event.payload)
    } else {
      console.log("Not a game start event");
    }
  }

  handleGameStart(payload) {
    // Remove modal and overlay
    this.modal.style.display = 'none';
    this.modalOverlay.style.display = 'none';

    // Spawn players
    const players = payload.players;
    this.curPlayerId = payload.id;
    for (const player of players) {
      this.players.push(player)
      var x_pos = player.position.x
      var y_pos = player.position.y

      console.log("x_pos: " + x_pos + " y_pos: " + y_pos);

      this.canvas.beginPath();
      this.canvas.rect(x_pos, y_pos, 10, 10);
      if (this.curPlayerId == player.playerId) {
        this.canvas.fillStyle = "#0000FF";
      } else {
        this.canvas.fillStyle = "#FF0000";
      }
      this.canvas.fill();
      this.canvas.closePath();
    }

    // Start game
    this.startGameLoop();
  }

  handlePartyCreated(payload) {
    const partyID = payload.partyID;
    var partyCodeElement = document.getElementById("party-code");
    partyCodeElement.style.visibility = 'visible';
    partyCodeElement.textContent = 'PARTY CODE: ' + partyID;
  }

  handlePlayerPositionsUpdate(payload) {
    const players = payload.players;
    for (const player of players) {
      this.players[player.playerId].position.x = player.position.x
      this.players[player.playerId].position.y = player.position.y
    }
  }

  startGameLoop() {
    const loop = (currentTime) => {
      const deltaTime = (currentTime - this.lastFrameTime) / 1000; 
      this.lastFrameTime = currentTime;

      // Update player data
      this.update(currentTime, deltaTime);

      // Redraw frame
      this.draw();

      requestAnimationFrame(loop); 
    };

    requestAnimationFrame(loop); // Frequency of calls matches refresh rate
  }

  update(currentTime, deltaTime) {
    var moved = false;
    var pressedKeys = []
    if (this.keys['ArrowLeft']) {
      pressedKeys.push('ArrowLeft')
      this.players[this.curPlayerId].position.x -= this.playerSpeedX * deltaTime;
      moved = true;
    }
    if (this.keys['ArrowRight']) {
      pressedKeys.push('ArrowRight')
      this.players[this.curPlayerId].position.x += this.playerSpeedX * deltaTime;
      moved = true
    }
    
    // Send movement events to server every "sendRate" ms
    if (moved && currentTime - this.lastSentTime > this.sendRate) {
      const updatedPosition = {
        playerId: this.curPlayerId,
        pressedKeys: pressedKeys,
        timeSinceLastEvent: deltaTime,
      };
      const playerMoved = new CustomEvent("PLAYER_MOVED", updatedPosition)
      this.wsManager.send(playerMoved);
      this.lastSentTime = currentTime;
    } 
  }

  draw() {
    this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);

    this.players.forEach(player => {
      this.canvas.beginPath();
      this.canvas.rect(player.position.x, player.position.y, 10, 10);
      this.canvas.fillStyle = player.playerId === this.curPlayerId ? "#0000FF" : "#FF0000"; 
      this.canvas.fill();
      this.canvas.closePath();
    });
  }
}