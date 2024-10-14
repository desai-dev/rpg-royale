import { CustomEvent } from './event.js';
import { CollisionBlock } from './collisionBlock.js'
import { Player } from './player.js'
import { Bullet } from './bullet.js'

export class GameManager {
  constructor(wsManager) {
    const canvas = document.getElementById("myCanvas");
    this.canvas = canvas.getContext("2d");
    this.wsManager = wsManager;
    this.modal = document.getElementById('gameModal');
    this.modalOverlay = document.getElementById('modalOverlay');
    this.players = [];
    this.playerInputs = [];
    this.collisionBlocks = [];
    this.bullets = [];
    this.bulletCooldown = 3; // Cooldown in seconds
    this.inputNumber = 0;
    this.curPlayerId = null;
    this.keys = {}; // Tracks keys that are pressed
    this.lastXMovementKeyPressed = ""
    this.lastFrameTime = 0; // Tracks last time a frame was fetched
    this.lastSentTime = 0; // Tracks the last time an event was sent to the server
    this.sendRate = 15; // How many ms between events sent to the server 

    // Event listeners for key presses
    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
      if (event.key == "ArrowRight" || event.key == "ArrowLeft") {
        this.lastXMovementKeyPressed = event.key
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false; 
      if (event.key === "ArrowRight" && this.keys["ArrowLeft"]) {
        this.lastXMovementKeyPressed = "ArrowLeft";
      } else if (event.key === "ArrowLeft" && this.keys["ArrowRight"]) {
        this.lastXMovementKeyPressed = "ArrowRight";
      }
    });
  }

  routeEvent(event) {
    if (event.type == "GAME_START") {
      this.handleGameStart(event.payload);
    } else if (event.type == "PARTY_CREATED") {
      this.handlePartyCreated(event.payload);
    } else if (event.type == "PLAYERS_UPDATE") {
      this.handlePlayersUpdate(event.payload);
    } else if (event.type == "BULLET_FIRED") {
      this.handleBulletFired(event.payload);
    } else {
      console.log("Not an event");
    }
  }

  handleGameStart(payload) {
    // Remove modal and overlay
    this.modal.style.display = 'none';
    this.modalOverlay.style.display = 'none';

    // Setup map
    payload.map.forEach((coords) => {
      this.collisionBlocks.push(new CollisionBlock(
        {x: coords[0], y: coords[1]},
        this.canvas
      ))
    })

    // Spawn players
    const players = payload.players;
    this.curPlayerId = payload.id;
    for (const player of players) {
      this.players.push(new Player(
        player.playerId,
        payload.id,
        {x: player.position.x, y: player.position.y},
        this.collisionBlocks,
        this.canvas
      ))
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

  handlePlayersUpdate(payload) {
    const players = payload.players;
    for (const player of players) {
      // Update player
      this.players[player.playerId].position.x = player.position.x
      this.players[player.playerId].position.y = player.position.y
      this.players[player.playerId].health = player.health

      // Perform server reconciliation
      if (player.playerId === this.curPlayerId) {
        // Get index of latest event that server processed
        const serverProccesedIndex = this.playerInputs.findIndex(input => {
          return input.inputNumber === player.inputNumber
        })
        // Get rid of all events that were already processed
        if (serverProccesedIndex > -1) {
          this.playerInputs.splice(0, serverProccesedIndex + 1)
        }
        // Apply unprocessed events
        this.playerInputs.forEach(input => {
          this.players[player.playerId].position.x += input.dx
          this.players[player.playerId].position.y += input.dy
        })
      }
    }
  }
  
  handleBulletFired(payload) {
    this.bullets.push(new Bullet(
      { x: payload.position.x, y: payload.position.y },
      payload.velocityX,
      this.canvas
    ));
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
    var dx = 0;
    var dy = 0;
    var bulletFired = false;
    var pressedKeys = [];
    this.players[this.curPlayerId].velocityX = 0;

    // Move left
    if (this.keys['ArrowLeft'] && !this.keys['ArrowRight']) {
      pressedKeys.push("ArrowLeft");
      this.players[this.curPlayerId].velocityX = -this.players[this.curPlayerId].speedX * deltaTime;
      dx = this.players[this.curPlayerId].velocityX;
    }

    // Move right
    if (this.keys['ArrowRight'] && !this.keys['ArrowLeft']) {
      pressedKeys.push("ArrowRight");
      this.players[this.curPlayerId].velocityX = this.players[this.curPlayerId].speedX * deltaTime;
      dx = this.players[this.curPlayerId].velocityX;
    }

    // Move in the direction of the last movement key press
    if (this.keys['ArrowLeft'] && this.keys['ArrowRight']) {
      if (this.lastXMovementKeyPressed === "ArrowLeft") {
        pressedKeys.push("ArrowLeft");
        this.players[this.curPlayerId].velocityX = -this.players[this.curPlayerId].speedX * deltaTime;
        dx = this.players[this.curPlayerId].velocityX;
      } else if (this.lastXMovementKeyPressed === "ArrowRight") {
        pressedKeys.push("ArrowRight");
        this.players[this.curPlayerId].velocityX = this.players[this.curPlayerId].speedX * deltaTime;
        dx = this.players[this.curPlayerId].velocityX;
      }
    }

    // Jump
    if (this.keys['ArrowUp'] && this.players[this.curPlayerId].isGrounded) {
      this.players[this.curPlayerId].isGrounded = false;
      pressedKeys.push("ArrowUp");
      this.players[this.curPlayerId].velocityY = this.players[this.curPlayerId].jumpPower * deltaTime;
      dy = this.players[this.curPlayerId].velocityY
    }

    // Fire Bullet
    if (this.bulletCooldown > 0) this.bulletCooldown -= deltaTime
    console.log(this.bulletCooldown)
    if (this.keys[" "] && this.bulletCooldown <= 0) {
      var velocityDir = (this.lastXMovementKeyPressed == "ArrowRight") ? 1 : -1;
      var bulletX = (this.lastXMovementKeyPressed == "ArrowRight") ? 
        this.players[this.curPlayerId].position.x +  this.players[this.curPlayerId].width + 0.01 :
        this.players[this.curPlayerId].position.x - 30 - 0.01; // TODO: Remove magic numbers here
      this.bulletCooldown = 3; 
      bulletFired = true;
      this.bullets.push(new Bullet(
        { x: bulletX,
          y: this.players[this.curPlayerId].position.y
        },
        velocityDir * 1000 * deltaTime,
        this.canvas
      ));
    }

    // Send events to server every "sendRate" ms
    if (currentTime - this.lastSentTime > this.sendRate) {
      // Movement events
      const updatedPosition = {
        playerId: this.curPlayerId,
        pressedKeys: pressedKeys,
        timeSinceLastEvent: deltaTime,
        inputNumber: this.inputNumber,
      };
      this.playerInputs.push({inputNumber: this.inputNumber, dx: dx, dy: dy})
      this.inputNumber++
      const playerMoved = new CustomEvent("PLAYER_MOVED", updatedPosition)
      this.wsManager.send(playerMoved);
      
      // Bullet events
      if (bulletFired) {
        const bulletUpdate = {
          playerId: this.curPlayerId,
          timeSinceLastEvent: deltaTime,
        }
        const bulletEvent = new CustomEvent("BULLET_FIRED", bulletUpdate)
        this.wsManager.send(bulletEvent);
      }

      this.lastSentTime = currentTime;
    } 
  }

  clearRect() {
    this.canvas.save();
    this.canvas.setTransform(1, 0, 0, 1, 0, 0);
    this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    this.canvas.restore();
  }

  draw() {
    this.clearRect();

    this.collisionBlocks.forEach(collisionBlock => {
      collisionBlock.update()
    })

    this.players.forEach(player => { 
      player.update()
    });

    // Simultaneously updates bullets and filters them out if they are 
    // off the screen
    this.bullets = this.bullets.filter(bullet => 
      bullet.update()
    );
  }
}