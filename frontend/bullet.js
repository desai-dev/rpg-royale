import { checkCollision } from "./collision.js"
import { settings } from "./settings.js";

export class Bullet {
  constructor(position, velocityX, velocityY, width, height, collisionBlocks, canvas) {
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.position = position;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.collisionBlocks = collisionBlocks;

    this.image = new Image();
    this.image.src = "./assets/wallbreaker-bullet.png";
  }

  // Draws a bullet and returns whether or not that bullet is off the screen
  draw() {
    this.position.x += this.velocityX
    this.position.y += this.velocityY

    // If bullet off the screen, remove it
    if (this.position.x < 0 || this.position.x > settings.game.nativeWidth) {
      return false;
    }

    // If bullet collided with platform, remove it
    for (let block of this.collisionBlocks) {
      if (checkCollision(block, this)) {
        return false; 
      }
    }

    // Draw bullet
    this.canvas.beginPath();
    this.canvas.rect(this.position.x, this.position.y, this.width, this.height);
    this.canvas.fillStyle = "#004d1d"; 
    this.canvas.fill();
    this.canvas.closePath();

    // Define the visual dimensions you want for the bullet image
    const displayWidth = 100;
    const displayHeight = 100;

    // Calculate offsets to keep the image centered on the hitbox
    const offsetX = (displayWidth - this.width) / 2;
    const offsetY = (displayHeight - this.height) / 2;

    // Draw the bullet image with the specified display size, centered on the hitbox
    this.canvas.drawImage(
        this.image,
        this.position.x - offsetX,
        this.position.y - offsetY,
        displayWidth,
        displayHeight
    );

    return true;
  }

  update() {
    return this.draw()
  }
}