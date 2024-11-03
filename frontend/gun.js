import { Bullet } from './bullet.js'

export class Gun {
  constructor(reloadTime, rotationAmount, bulletSpeedX, bulletDamage, bulletWidth, bulletHeight) {
    this.reloadTime = reloadTime;
    this.cooldown = 0;
    this.rotationAmount = rotationAmount;
    this.bulletSpeedX = bulletSpeedX;
    this.bulletDamage = bulletDamage;
    this.bulletWidth = bulletWidth;
    this.bulletHeight = bulletHeight;
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot(curPlayer, lastXMovementKeyPressed, collisionBlocks, canvas, deltaTime) {
    if (this.canShoot()) {
      this.cooldown = this.reloadTime;
      var velocityDir = (lastXMovementKeyPressed == "ArrowRight") ? 1 : -1;
      var bulletX = (lastXMovementKeyPressed == "ArrowRight") ? 
        curPlayer.position.x +  curPlayer.width + 0.01 :
        curPlayer.position.x - this.bulletWidth - 0.01;
      return new Bullet(
          { x: bulletX,
            y: curPlayer.position.y
          },
          velocityDir * this.bulletSpeedX * deltaTime,
          this.bulletWidth,
          this.bulletHeight,
          collisionBlocks,
          canvas
      )
    } else {
      return null
    }
  }

  updateCooldown(deltaTime) {
    this.cooldown = Math.max(this.cooldown - deltaTime, 0);
  }
}
