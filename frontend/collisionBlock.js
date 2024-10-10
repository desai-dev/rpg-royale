export class CollisionBlock {
  constructor(position, canvas) {
    this.position = position
    this.canvas = canvas
    this.width = 30
    this.height = 30
    this.position.x *= this.width
    this.position.y *= this.height
  }

  draw() {
    this.canvas.fillStyle = 'rgba(255, 0, 0, 0.5)'
    this.canvas.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update() {
    this.draw()
  }
}