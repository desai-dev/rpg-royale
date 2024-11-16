package main

// Define all game settings here to use in the rest of the code
const (
	// Player settings
	playerSpeedX       = 500
	playerJumpPower    = -800
	playerHealth       = 100
	playerHeight       = 150
	playerWidth        = 60
	playerMaxFallSpeed = 30
	playerSpawnMaxX    = 1800

	// Party settings
	partyStringLength = 10
	maxPartySize      = 2

	// Collision Block Settings
	collisionBlockWidth  = 30
	collisionBlockHeight = 30

	// Bullet Settings
	sniperBulletWidth       = 60
	sniperBulletHeight      = 30
	sniperBulletSpeedX      = 1500
	sniperBulletDamage      = 45
	wallbreakerBulletWidth  = 30
	wallbreakerBulletHeight = 30
	wallbreakerBulletSpeedX = 2000
	wallbreakerBulletDamage = 10

	// Gun settings
	sniperCooldown            = 1.5
	wallbreakerCooldown       = 0.5
	sniperRotationAmount      = 3
	wallbreakerRotationAmount = 3
	sniperHeight              = 150
	sniperWidth               = 150
	wallbreakerHeight         = 150
	wallbreakerWidth          = 150
	maxGunAngle               = 45
	minGunAngle               = -45

	// General game settings
	nativeWidth     = 1920
	nativeHeight    = 1080
	gravityConstant = 0.5
	frameRate       = 15
)
