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
    this.lastFrameTime = 0; // Tracks last time a fram was fetched
    this.lastSentTime = 0; // Tracks the last time an event was sent to the server
    this.sendRate = 50; // How many ms between events sent to the server 

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
    console.log("WebSocket message received: ", event);
    if (event.type == "GAME_START") {
      this.handleGameStart(event.payload);
    } else if (event.type == "PARTY_CREATED") {
      this.handlePartyCreated(event.payload);
    } else if (event.type == "PLAYER_MOVED") {
      this.handlePlayerMoved(event.payload)
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

  handlePlayerMoved(payload) {
    this.players[payload.playerId].position.x = payload.x
    this.players[payload.playerId].position.y = payload.y
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

    requestAnimationFrame(loop);
  }

  update(currentTime, deltaTime) {
    var moved = false;
    if (this.keys['ArrowLeft']) {
      this.players[this.curPlayerId].position.x -= this.playerSpeedX * deltaTime;
      moved = true;
    }
    if (this.keys['ArrowRight']) {
      this.players[this.curPlayerId].position.x += this.playerSpeedX * deltaTime;
      moved = true
    }
    
    // Only send movement events every "sendRate" ms
    if (moved && currentTime - this.lastSentTime > this.sendRate) {
      const updatedPosition = {
        playerId: this.curPlayerId,
        x: this.players[this.curPlayerId].position.x,
        y: this.players[this.curPlayerId].position.y
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