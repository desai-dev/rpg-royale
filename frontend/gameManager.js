import { CustomEvent } from './event.js';
import { CollisionBlock } from './collisionBlock.js'
import { Player } from './player.js'
import { Bullet } from './bullet.js'
import { settings } from './settings.js'

export class GameManager {
  constructor(wsManager) {
    this.canvasCenterX = null;
    this.canvasCenterY = null;
    this.mapCenterX = null;
    this.mapCenterY = null;
    this.scaleFitNative = null;
    const canvas = document.getElementById("myCanvas");
    this.canvas = canvas.getContext("2d");
    this.wsManager = wsManager;
    this.modal = document.getElementById('gameModal');
    this.modalOverlay = document.getElementById('modalOverlay');
    this.players = [];
    this.playerInputs = [];
    this.collisionBlocks = [];
    this.bullets = [];
    this.inputNumber = 0;
    this.curPlayerId = null;
    this.keys = {}; // Tracks keys that are pressed
    this.lastXMovementKeyPressed = ""
    this.lastRotationKeyPressed = ""
    this.gunSwitched = false
    this.gunRotated = false
    this.lastFrameTime = 0; // Tracks last time a frame was fetched
    this.lastSentTime = 0; // Tracks the last time an event was sent to the server
    this.sendRate = settings.game.frameRate; // How many ms between events sent to the server 
    this.placeBuild = false
    this.newBlocks = []

    // Event listeners for key presses
    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
      if (event.key == "ArrowRight" || event.key == "ArrowLeft") {
        this.lastXMovementKeyPressed = event.key
      } else if (event.key == 'r') {
        this.gunSwitched = true
      } else if (event.key == 'w' || event.key == "s") {
        this.gunRotated = true
        this.lastRotationKeyPressed = event.key
      } else if (event.key === "b") {
        this.players[this.curPlayerId].toggleBuildingMode()
      } else if (event.key == "c") {
        this.placeBuild = true
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false; 
      if (event.key === "ArrowRight" && this.keys["ArrowLeft"]) {
        this.lastXMovementKeyPressed = "ArrowLeft";
      } else if (event.key === "ArrowLeft" && this.keys["ArrowRight"]) {
        this.lastXMovementKeyPressed = "ArrowRight";
      } else if (event.key === "w" && this.keys["w"]) {
        this.lastRotationKeyPressed = "w"
      } else if (event.key === "s" && this.keys["s"]) {
        this.lastRotationKeyPressed = "s"
      } else if (event.key == "c") {
        this.placeBuild = false
      }

      if (!this.keys["w"] && !this.keys["s"]) this.gunRotated = false
    });

    window.addEventListener("mousemove", (event) => {
      if (this.players.length != 0) {
        const rect = this.canvas.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
  
        // Adjust coordinates for the canvas transformation
        const translatedX = (mouseX - (this.canvasCenterX - this.mapCenterX * this.scaleFitNative)) / this.scaleFitNative;
        const translatedY = (mouseY - (this.canvasCenterY - this.mapCenterY * this.scaleFitNative)) / this.scaleFitNative;
  
        this.players[this.curPlayerId].updateMousePositions(translatedX, translatedY)
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
    } else if (event.type == "MAP_UPDATE") {
      this.handleMapUpdate(event.payload);
    } else {
      console.log("Not an event");
    }
  }

  updateGameDimensions(canvasCenterX, canvasCenterY, mapCenterX, mapCenterY, scaleFitNative) {
    this.canvasCenterX = canvasCenterX;
    this.canvasCenterY = canvasCenterY;
    this.mapCenterX = mapCenterX;
    this.mapCenterY = mapCenterY;
    this.scaleFitNative = scaleFitNative;
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

    for (const player of this.players) {
      player.players = this.players
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
      this.players[player.playerId].curGunIndex = player.curGunIdx
      this.players[player.playerId].curGun = this.players[player.playerId].guns[player.curGunIdx]
      this.players[player.playerId].direction = player.gunDirection
      this.players[player.playerId].gunAngle = player.gunRotation

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
      payload.name,
      { x: payload.position.x, y: payload.position.y },
      payload.velocityX,
      payload.velocityY,
      payload.width,
      payload.height,
      this.collisionBlocks,
      this.canvas
    ));
  }

  async handleMapUpdate(payload) {
    this.collisionBlocks = payload.blocks.map(blockData => {
      return new CollisionBlock({x: blockData.position.x / settings.collisionBlock.width, y: blockData.position.y / settings.collisionBlock.height}, this.canvas);
    });
    for (var player of this.players) {
      player.collisionBlocks = this.collisionBlocks
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

    // Rotate gun
    if (this.keys['w'] || this.keys['s'] || this.keys['ArrowLeft'] || this.keys['ArrowRight']) {
      this.players[this.curPlayerId].rotateGun(this.keys['w'], this.keys['s'], this.lastRotationKeyPressed, this.lastXMovementKeyPressed)
    }

    // Switch guns
    if (this.gunSwitched) {
      this.gunSwitched = false
      this.players[this.curPlayerId].switchGun()
      pressedKeys.push("r")
    }

    // Fire bullets
    var curGun = this.players[this.curPlayerId].curGun
    curGun.updateCooldown(deltaTime)
    if (this.keys[" "] && curGun.canShoot()) {
      var bullet = curGun.shoot(this.players[this.curPlayerId], this.lastXMovementKeyPressed, this.collisionBlocks, this.canvas, deltaTime);
      this.bullets.push(bullet)
      bulletFired = true;
    }

    // Place builds
    var placedBlock = null
    if (this.players[this.curPlayerId].buildingMode) pressedKeys.push("b")
    if (this.placeBuild) pressedKeys.push("c")
    if (this.players[this.curPlayerId].buildingMode && this.placeBuild) {
      if (this.players[this.curPlayerId].closestValidBlock) {
        placedBlock = this.players[this.curPlayerId].closestValidBlock
        this.collisionBlocks.push(this.players[this.curPlayerId].closestValidBlock);
        this.players[this.curPlayerId].closestValidBlock = null;
      }
    }

    // Send events to server every "sendRate" ms
    if (currentTime - this.lastSentTime > this.sendRate) { // TODO: Group all the events into one big payload
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

      // Gun rotation events
      if (this.gunRotated) {
        const gunRotationUpdate = {
          playerId: this.curPlayerId,
          keyPressed: this.lastRotationKeyPressed
        }
        const gunRotationEvent = new CustomEvent("GUN_ROTATION", gunRotationUpdate)
        this.wsManager.send(gunRotationEvent);
      }

      // Block placement events
      if (placedBlock) {
        const blockPlacedUpdate = {
          playerId: this.curPlayerId,
          block: placedBlock
        }
        const blockPlacedEvent = new CustomEvent("BLOCK_PLACED", blockPlacedUpdate)
        this.wsManager.send(blockPlacedEvent);
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
    // off the screen or collided into a platform
    this.bullets = this.bullets.filter(bullet => 
      bullet.update()
    );
  }
}