import { settings } from './settings.js'

export class CollisionBlock {
  constructor(position, canvas) {
    this.position = position
    this.canvas = canvas
    this.width = settings.collisionBlock.width
    this.height = settings.collisionBlock.height
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