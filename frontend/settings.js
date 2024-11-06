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
      speedX: 1500,
      bulletDamage: 45,
    },
    wallBreakerBullet: {
      width: 30,
      height: 30,
      speedX: 2000,
      bulletDamage: 10,
    }
  },

  // Gun settings
  guns : {
    sniper: {
      cooldown: 1.5,
      rotationAmount: 3,
      height: 150, 
      width: 150,
    },
    wallBreaker: {
      cooldown: 0.5,
      rotationAmount: 3,
      height: 150, 
      width: 150
    },
    maxGunAngle: 45,
    minGunAngle: -45,
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
