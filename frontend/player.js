import { checkCollision } from "./collision.js";

export class Player {
  constructor(playerId, curPlayerId, position, collisionBlocks, canvas) {
    this.playerId = playerId;
    this.curPlayerId = curPlayerId;
    this.velocityX = 0;
    this.velocityY = 0;
    this.jumpPower = -800;
    this.gravity = 0.5;
    this.maxFallSpeed = 30;
    this.speedX = 500;
    this.position = position;
    this.isGrounded = true;
    this.health = 100;
    this.collisionBlocks = collisionBlocks;
    this.canvas = canvas;
    this.width = 60;
    this.height = 150;
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
      this.canvas.beginPath();
      this.canvas.rect(this.position.x, this.position.y, this.width, this.height);
      this.canvas.fillStyle = this.playerId === this.curPlayerId ? "#0000FF" : "#FF0000"; 
      this.canvas.fill();
      this.canvas.closePath();
    }
  }

  update() {
    this.draw()
  }
}