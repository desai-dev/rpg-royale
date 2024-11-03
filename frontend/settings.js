export const settings = {
  // Player settings
  player: {
    speedX: 500,
    jumpPower: -800,
    health: 100,
    height: 150,
    width: 60,
    maxFallSpeed: 30,
  },

  // Healthbar Settings
  healthBar: {
    width: 60,
    height: 10,
    pixelsAbovePlayer: 5,
  },

  // Collision Block Settings
  collisionBlock: {
    width: 30,
    height: 30,
  },

  // Bullet Settings
  bullets: {
    sniperBullet: {
      width: 60,
      height: 30,
      speedX: 1000,
      bulletCooldown: 3, // In seconds
      bulletDamage: 20,
    },
    wallBreakerBullet: {
      width: 30,
      height: 30,
      speedX: 3000,
      bulletCooldown: 1, // In seconds
      bulletDamage: 100,
    }
  },

  // Gun settings
  guns : {
    sniper: {
      cooldown: 3,
      rotationAmount: 3,
    },
    wallBreaker: {
      cooldown: 0.5,
      rotationAmount: 5
    }
  },

  // Map settings
  map : {
    tileSize: 30,
    mapColumns: 64,
    mapRows: 36,
  },

  // General game settings
  game: {
    nativeWidth: 1920,
    nativeHeight: 1080,
    gravityConstant: 0.5,
    frameRate: 15,
  }
};
