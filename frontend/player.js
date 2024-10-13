import { checkCollision } from "./collision.js";

export class Player {
  constructor(playerId, curPlayerId, position, collisionBlocks, canvas) {
    this.playerId = playerId;
    this.curPlayerId = curPlayerId;
    this.velocityX = 0;
    this.speedX = 500;
    this.position = position;
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

  draw() {
    this.position.x += this.velocityX // update position
    // check horizontal collision
    this.checkHorizontalCollisions()
    // apply gravity
    // check vertical collision
    this.canvas.beginPath();
    this.canvas.rect(this.position.x, this.position.y, 60, 150);
    this.canvas.fillStyle = this.playerId === this.curPlayerId ? "#0000FF" : "#FF0000"; 
    this.canvas.fill();
    this.canvas.closePath();
  }

  update() {
    this.draw()
  }
}