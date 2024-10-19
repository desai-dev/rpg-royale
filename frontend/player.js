import { checkCollision } from "./collision.js";
import { settings } from './settings.js'

export class Player {
  constructor(playerId, curPlayerId, position, collisionBlocks, canvas) {
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
    this.collisionBlocks = collisionBlocks;
    this.canvas = canvas;
    this.width = settings.player.width;
    this.height = settings.player.height;
    const image = new Image();
    image.src = this.playerId === this.curPlayerId ? "../blueTank.png" : "../redTank.png";
    this.image = image;
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

  

  draw() {
    // Update position
    this.position.x += this.velocityX

    // Check horizontal collision
    this.checkHorizontalCollisions()

    // Apply gravity
    this.applyGravity()

    // Check vertical collision
    this.checkVerticalCollisions()

    // Draw player
    if (this.health > 0) {
      this.image.height = 150
      this.image.width = 150
      this.canvas.beginPath();
      this.canvas.rect(this.position.x, this.position.y, this.width, this.height);
      this.canvas.fillStyle = this.playerId === this.curPlayerId ? "#0000FF" : "#FF0000"; 
      this.canvas.fill();
      this.canvas.closePath();
      this.canvas.drawImage(this.image, this.position.x, this.position.y, this.image.width, this.image.height);
    }
  }

  update() {
    this.draw()
  }
}