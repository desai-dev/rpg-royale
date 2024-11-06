import { checkCollision } from "./collision.js"
import { settings } from "./settings.js";

export class Bullet {
  constructor(name, position, velocityX, velocityY, width, height, collisionBlocks, canvas) {
    this.name = name
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.position = position;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.collisionBlocks = collisionBlocks;

    this.image = new Image();
    if (this.name == "Sniper") { // TODO: Add these names to settings
      this.image.src = "./assets/sniper-bullet.png";
      this.displayWidth = 100 // TODO: Add these to settings
      this.displayHeight = 100
    } else if (this.name == "Wallbreaker") {
      this.image.src = "./assets/wallbreaker-bullet.png";
      this.displayWidth = 60
      this.displayHeight = 60
    }
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

    // Leave this to see bullet hitboxes
    // this.canvas.beginPath();
    // this.canvas.rect(this.position.x, this.position.y, this.width, this.height);
    // this.canvas.fillStyle = "#FF0000"; 
    // this.canvas.fill();
    // this.canvas.closePath();

    // Calculate offsets to keep the image centered on the hitbox
    const offsetX = (this.displayWidth - this.width) / 2;
    const offsetY = (this.displayHeight - this.height) / 2;

    // Draw the bullet image with the specified display size, centered on the hitbox
    this.canvas.drawImage(
        this.image,
        this.position.x - offsetX,
        this.position.y - offsetY,
        this.displayWidth,
        this.displayHeight
    );

    return true;
  }

  update() {
    return this.draw()
  }
}