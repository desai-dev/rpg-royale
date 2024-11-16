import { Gun } from "./gun.js"
import { checkCollision } from "./collision.js";
import { settings } from "./settings.js";
import { CollisionBlock } from "./collisionBlock.js";

export class Player {
  constructor(playerId, curPlayerId, position, collisionBlocks, canvas) {
    this.players = null
    this.playerId = playerId;
    this.curPlayerId = curPlayerId;
    this.velocityX = 0;
    this.velocityY = 0;
    this.jumpPower = settings.player.jumpPower;
    this.gravity = settings.game.gravityConstant;
    this.maxFallSpeed = settings.player.maxFallSpeed;
    this.speedX = settings.player.speedX;
    this.position = position;
    this.isGrounded = false;
    this.health = settings.player.health;
    this.maxHealth = settings.player.health;
    this.collisionBlocks = collisionBlocks;
    this.canvas = canvas;
    this.width = settings.player.width;
    this.height = settings.player.height;
    this.guns = [
      new Gun("Sniper",
              this.canvas,
              "./assets/sniper.png",
              settings.guns.sniper.cooldown, 
              settings.guns.sniper.rotationAmount,
              settings.bullets.sniperBullet.speedX, 
              settings.bullets.sniperBullet.bulletDamage,
              settings.bullets.sniperBullet.width,
              settings.bullets.sniperBullet.height,
              settings.guns.sniper.height,
              settings.guns.sniper.width,
            ),
      new Gun("Wallbreaker",
              this.canvas,
              "./assets/wallbreaker.png",
              settings.guns.wallBreaker.cooldown, 
              settings.guns.wallBreaker.rotationAmount,
              settings.bullets.wallBreakerBullet.speedX, 
              settings.bullets.wallBreakerBullet.bulletDamage,
              settings.bullets.wallBreakerBullet.width,
              settings.bullets.wallBreakerBullet.height,
              settings.guns.wallBreaker.height,
              settings.guns.wallBreaker.width,
            )
    ];
    this.curGunIndex = 0;
    this.curGun = this.guns[this.curGunIndex];
    this.gunAngle = 0;
    this.direction = 1;
    this.buildingMode = false;
    this.closestValidBlock = null;
    this.mouseX = 0
    this.mouseY = 0
  }

  checkHorizontalCollisions() {
    this.collisionBlocks.forEach(block => {
      if (checkCollision(this, block)) {
        if (this.velocityX > 0) {
					this.velocityX = 0;
					this.position.x = block.position.x - this.width - 0.01;
				}
				if (this.velocityX < 0) {
					this.velocityX = 0;
					this.position.x = block.position.x + block.width + 0.01;
				}
      }
    });
  }

  applyGravity() {
    this.velocityY += this.gravity
		if (this.velocityY > this.maxFallSpeed) {
			this.velocityY = this.maxFallSpeed;
		}
		this.position.y += this.velocityY;
  }

  checkVerticalCollisions() {
    this.collisionBlocks.forEach(block => {
      if (checkCollision(this, block)) {
				if (this.velocityY > 0) {
					this.velocityY = 0;
					this.position.y = block.position.y - this.height - 0.01;
          this.isGrounded = true;
				}
				if (this.velocityY < 0) {
					this.velocityY = 0;
					this.position.y  = block.position.y + block.height + 0.01;
				}
      }
    });
  }

  drawHealthBar() {
    const healthBarWidth = settings.healthBar.width;
    const healthBarHeight = settings.healthBar.height;
    const healthPercentage = this.health / this.maxHealth;

    // Calculate the width of the health bar based on current health
    const currentHealthBarWidth = healthBarWidth * healthPercentage;

    // Position the health bar above the player's head
    const healthBarX = this.position.x;
    const healthBarY = this.position.y - healthBarHeight - settings.healthBar.pixelsAbovePlayer; 

    // Draw the health bar background 
    this.canvas.fillStyle = "#D3D3D3";
    this.canvas.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Draw the actual health bar
    this.canvas.fillStyle = "#FF69B4";
    this.canvas.fillRect(healthBarX, healthBarY, currentHealthBarWidth, healthBarHeight);
  }

  switchGun() {
    this.curGunIndex = (this.curGunIndex + 1) % this.guns.length
    this.curGun = this.guns[this.curGunIndex]
  }

  rotateGun(upKey, downKey, lastRotateKey, lastXMovementKeyPressed) {
    if (lastXMovementKeyPressed == "ArrowRight") {
      this.direction = 1
    } else if (lastXMovementKeyPressed == "ArrowLeft") {
      this.direction = -1
    }

    if (upKey && downKey) {
      if (lastRotateKey == 'w' && this.gunAngle > settings.guns.minGunAngle) {
        this.gunAngle -= this.curGun.rotationAmount
      } else if (lastRotateKey == 's' < settings.guns.maxGunAngle) {
        this.gunAngle += this.curGun.rotationAmount
      }
    } else if (upKey && this.gunAngle > settings.guns.minGunAngle) {
      this.gunAngle -= this.curGun.rotationAmount
    } else if (downKey && this.gunAngle < settings.guns.maxGunAngle) {
      this.gunAngle += this.curGun.rotationAmount
    }
  }

  updateMousePositions(x, y) {
    this.mouseX = x
    this.mouseY = y
  }

  toggleBuildingMode() {
    this.buildingMode = !this.buildingMode;
    if (!this.buildingMode) {
      this.closestValidBlock = null;
    }
  }

  isValidPlacement(position) {
    // Check if the block collides with any other player
    const a = {
      position: { x: position.x, y: position.y },
      width: settings.collisionBlock.width,
      height: settings.collisionBlock.height,
    };

    for (const player of this.players) {
      if (checkCollision(a, player)) return false
    }

    return true
  }

  findClosestValidPlacement() {
    var closestBlock = null;
    var minDistance = Infinity;

    for (var block of this.collisionBlocks) {
      // Get adjacent positions around the block
      const adjacentPositions = [
        { x: block.position.x, y: block.position.y - block.height }, // Above
        { x: block.position.x, y: block.position.y + block.height }, // Below
        { x: block.position.x - block.width, y: block.position.y }, // Left
        { x: block.position.x + block.width, y: block.position.y }, // Right
      ];

      for (var position of adjacentPositions) {
        // Check if within 3 tiles (3 * blockSize)
        const distFromPlayer = Math.hypot(position.x - this.position.x, position.y - this.position.y);
        if (distFromPlayer <= (3 * settings.collisionBlock.width) + this.height) {
          // Check distance from mouse position
          const distFromMouse = Math.hypot(position.x - this.mouseX, position.y - this.mouseY);
          if (distFromMouse < minDistance && this.isValidPlacement(position)) {
            minDistance = distFromMouse;
            closestBlock = position;
          }
        }
      }
    }

    if (closestBlock) {
      this.closestValidBlock = new CollisionBlock({x: closestBlock.x / settings.collisionBlock.width, y: closestBlock.y / settings.collisionBlock.height}, this.canvas);
    } else {
      this.closestValidBlock = null;
    }
  }

  draw() {
    // Update position
    this.position.x += this.velocityX

    // Check horizontal collision
    this.checkHorizontalCollisions()

    // Apply gravity
    this.applyGravity()

    // Check vertical collision
    this.checkVerticalCollisions()

    if (this.health > 0) {
      // Draw player
      this.canvas.beginPath();
      this.canvas.rect(this.position.x, this.position.y, this.width, this.height);
      this.canvas.fillStyle = this.playerId === this.curPlayerId ? "#0000FF" : "#800020"; 
      this.canvas.fill();
      this.canvas.closePath();

      // Draw healthbar
      this.drawHealthBar();

      // Draw gun
      const gunX = this.position.x + this.width / 2;
      const gunY = this.position.y + this.height / 2;
      this.curGun.draw(gunX, gunY, this.gunAngle, this.direction);

      // Draw closest valid block in build mode
      if (this.buildingMode) {
        this.findClosestValidPlacement()
        if (this.closestValidBlock) {
          const { x, y } = this.closestValidBlock.position;
          this.canvas.fillStyle = "rgba(255, 0, 0, 0.5)";
          this.canvas.fillRect(x, y, 30, 30);
        }
      }
    }
  }

  update() {
    this.draw()
  }
}