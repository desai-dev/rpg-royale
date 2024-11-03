import { Gun } from "./gun.js"
import { checkCollision } from "./collision.js";
import { settings } from "./settings.js";

export class Player {
  constructor(playerId, curPlayerId, position, collisionBlocks, canvas) {
    this.playerId = playerId;
    this.curPlayerId = curPlayerId;
    this.velocityX = 0;
    this.velocityY = 0;
    this.jumpPower = settings.player.jumpPower;
    this.gravity = settings.game.gravityConstant;
    this.maxFallSpeed = settings.player.maxFallSpeed;
    this.speedX = settings.player.speedX;
    this.position = position;
    this.isGrounded = false;
    this.health = settings.player.health;
    this.maxHealth = settings.player.health;
    this.collisionBlocks = collisionBlocks;
    this.canvas = canvas;
    this.width = settings.player.width;
    this.height = settings.player.height;
    this.guns = [
      new Gun(settings.guns.sniper.cooldown, 
              settings.guns.sniper.rotationAmount,
              settings.bullets.sniperBullet.speedX, 
              settings.bullets.sniperBullet.bulletDamage,
              settings.bullets.sniperBullet.width,
              settings.bullets.sniperBullet.height),
      new Gun(settings.guns.wallBreaker.cooldown, 
              settings.guns.wallBreaker.rotationAmount,
              settings.bullets.wallBreakerBullet.speedX, 
              settings.bullets.wallBreakerBullet.bulletDamage,
              settings.bullets.wallBreakerBullet.width,
              settings.bullets.wallBreakerBullet.height,
            )
    ];
    this.curGunIndex = 0;
    this.curGun = this.guns[this.curGunIndex];
    this.gunAngle = 0;
    const image = new Image();
    image.src = this.playerId === this.curPlayerId ? "./assets/blueTank.png" : "./assets/redTank.png";
    this.image = image;
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

  drawHealthBar() {
    const healthBarWidth = settings.healthBar.width;
    const healthBarHeight = settings.healthBar.height;
    const healthPercentage = this.health / this.maxHealth;

    // Calculate the width of the health bar based on current health
    const currentHealthBarWidth = healthBarWidth * healthPercentage;

    // Position the health bar above the player's head
    const healthBarX = this.position.x;
    const healthBarY = this.position.y - healthBarHeight - settings.healthBar.pixelsAbovePlayer; 

    // Draw the health bar background 
    this.canvas.fillStyle = "#D3D3D3";
    this.canvas.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Draw the actual health bar
    this.canvas.fillStyle = "#FF69B4";
    this.canvas.fillRect(healthBarX, healthBarY, currentHealthBarWidth, healthBarHeight);
  }

  switchGun() {
    this.curGunIndex = (this.curGunIndex + 1) % this.guns.length
    this.curGun = this.guns[this.curGunIndex]
  }

  rotateGun(upKey, downKey, lastRotateKey) {
    if (upKey && downKey) {
      if (lastRotateKey == 'w') {
        this.gunAngle -= this.curGun.rotationAmount
      } else if (lastRotateKey == 's') {
        this.gunAngle += this.curGun.rotationAmount
      }
    } else if (upKey) {
      this.gunAngle -= this.curGun.rotationAmount
    } else if (downKey) {
      this.gunAngle += this.curGun.rotationAmount
    }
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

    if (this.health > 0) {
      // Draw player
      this.canvas.beginPath();
      this.canvas.rect(this.position.x, this.position.y, this.width, this.height);
      this.canvas.fillStyle = this.playerId === this.curPlayerId ? "#0000FF" : "#FF0000"; 
      this.canvas.fill();
      this.canvas.closePath();

      // Draw healthbar
      this.drawHealthBar();

      // Save canvas state
      this.canvas.save();

      // Translate context to player's position + gun's offset
      const gunX = this.position.x + this.width / 2;
      const gunY = this.position.y + this.height / 2;
      this.canvas.translate(gunX, gunY);
  
      // Apply gun rotation
      this.canvas.rotate(this.gunAngle * Math.PI / 180);
  
      // Draw gun image centered at the translated origin
      this.image.height = 150;
      this.image.width = 150;
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

  update() {
    this.draw()
  }
}