package main

type Bullet struct {
	playerId  int
	velocityX float64
	velocityY float64
	position  Position
	width     float64
	height    float64
	damage    float64
}

// Initializes a new bullet
func NewBullet(playerId int, velocityX float64, velocityY float64, width float64, height float64, x float64, y float64) *Bullet {
	return &Bullet{
		playerId:  playerId,
		velocityX: velocityX,
		velocityY: velocityY,
		position:  Position{X: x, Y: y},
		width:     width,
		height:    height,
	}
}

// Returns a sniper bullet
func NewSniperBullet(playerId int, velocityX float64, velocityY float64, x float64, y float64, deltaTime float64) *Bullet {
	return &Bullet{
		playerId:  playerId,
		velocityX: sniperBulletSpeedX * velocityX * deltaTime,
		velocityY: sniperBulletSpeedX * velocityY * deltaTime,
		position:  Position{X: x, Y: y},
		width:     sniperBulletWidth,
		height:    sniperBulletHeight,
		damage:    sniperBulletDamage,
	}
}

// Returns a wallbreaker bullet
func NewWallbreakerBullet(playerId int, velocityX float64, velocityY float64, x float64, y float64, deltaTime float64) *Bullet {
	return &Bullet{
		playerId:  playerId,
		velocityX: wallbreakerBulletSpeedX * velocityX * deltaTime,
		velocityY: wallbreakerBulletSpeedX * velocityY * deltaTime,
		position:  Position{X: x, Y: y},
		width:     wallbreakerBulletWidth,
		height:    wallbreakerBulletHeight,
		damage:    wallbreakerBulletDamage,
	}
}

func (b *Bullet) updatePosition(x float64, y float64) bool {
	b.position.X = x
	b.position.Y = y
	return !(b.position.X < 0 || b.position.X > nativeWidth)
}

//////// ******** Functions for Collider interface implementation ******** ////////

func (b *Bullet) Position() Position {
	return b.position
}

func (b *Bullet) Width() float64 {
	return b.width
}

func (b *Bullet) Height() float64 {
	return b.height
}

//////// ******** End of Functions for Collider interface implementation ******** ////////
