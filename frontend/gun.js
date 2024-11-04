import { Bullet } from './bullet.js'
import { settings } from './settings.js';

export class Gun {
  constructor(canvas, imgSrc, reloadTime, rotationAmount, bulletSpeedX, bulletDamage, bulletWidth, bulletHeight, height, width) {
    this.canvas = canvas
    this.reloadTime = reloadTime;
    this.cooldown = 0;
    this.rotationAmount = rotationAmount;
    this.bulletSpeedX = bulletSpeedX;
    this.bulletDamage = bulletDamage;
    this.bulletWidth = bulletWidth;
    this.bulletHeight = bulletHeight;
    this.height = height
    this.width = width

    const image = new Image
    image.src = imgSrc
    this.image = image
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot(curPlayer, lastXMovementKeyPressed, collisionBlocks, canvas, deltaTime) {
    if (this.canShoot()) {
      this.cooldown = this.reloadTime;

      var direction = 1
      if (lastXMovementKeyPressed == "ArrowRight") {
        direction = 1
      } else if (lastXMovementKeyPressed == "ArrowLeft") {
        direction = -1
      }

      const angleInRadians = curPlayer.gunAngle * (Math.PI / 180);
      const velocityX = this.bulletSpeedX * Math.cos(angleInRadians);
      const velocityY = this.bulletSpeedX * Math.sin(angleInRadians);

      var bulletX = curPlayer.position.x + (this.width / 2) * Math.cos(angleInRadians);
      var bulletY = curPlayer.position.y + (this.height / 2) * Math.sin(angleInRadians);

      // Adjust for direction
      if (direction < 0) {
        bulletX = curPlayer.position.x - (this.width / 2) * Math.cos(angleInRadians);
        bulletY = curPlayer.position.y + (this.height / 2) * Math.sin(angleInRadians);
      }

      return new Bullet(
          { x: bulletX,
            y: bulletY
          },
          velocityX * direction * deltaTime,
          velocityY * deltaTime,
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

  draw(gunX, gunY, gunAngle, direction) {
    // Save canvas state
    this.canvas.save();

    // Translate canvas
    this.canvas.translate(gunX, gunY);
  
    // Apply gun rotation
    this.canvas.scale(direction, 1);
    this.canvas.rotate(gunAngle * Math.PI / 180);

    // Draw gun image centered at the translated origin
    this.canvas.drawImage(
      this.image,
      -this.image.width / 2,
      -this.image.height / 2,
      this.image.width,
      this.image.height
    );

    // Restore canvas rotation for other drawings
    this.canvas.restore();
  }
}
