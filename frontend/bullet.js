import { nativeWidth } from "./index.js"
export class Bullet {
  constructor(position, velocityX, canvas) {
    this.velocityX = velocityX;
    this.position = position;
    this.canvas = canvas;
    this.width = 30;
    this.height = 30;
  }

  // Draws a bullet and returns whether or not that bullet is off the screen
  draw() {
    this.position.x += this.velocityX

    // If bullet off the screen, remove it
    if (this.position.x < 0 || this.position.x > nativeWidth) {
      return false;
    }

    // Draw bullet
    this.canvas.beginPath();
    this.canvas.rect(this.position.x, this.position.y, this.width, this.height);
    this.canvas.fillStyle = "#c300ff"; 
    this.canvas.fill();
    this.canvas.closePath();

    return true;
  }

  update() {
    return this.draw()
  }
}