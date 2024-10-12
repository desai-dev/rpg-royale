export class Player {
  constructor(playerId, curPlayerId, position, canvas) {
    this.playerId = playerId
    this.curPlayerId = curPlayerId
    this.velocityX = 0;
    this.position = position
    this.canvas = canvas
    this.width = 60
    this.height = 150
  }

  draw() {
    this.position.x += this.velocityX
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