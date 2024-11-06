package main

// Stores general bullet information
type Bullet struct {
	playerId  int
	velocityX float64
	velocityY float64
	position  Position
	width     float64
	height    float64
	damage    float64
	name      string
}

// Stores information for a type of bullet
type BulletType struct {
	width  float64
	height float64
	speed  float64
	damage float64
	name   string
}

// Initializes a new bullet
func NewBullet(playerId int, bulletType *BulletType, velocityX float64, velocityY float64, x float64, y float64, deltaTime float64) *Bullet {
	return &Bullet{
		playerId:  playerId,
		velocityX: bulletType.speed * velocityX * deltaTime,
		velocityY: bulletType.speed * velocityY * deltaTime,
		position:  Position{X: x, Y: y},
		width:     bulletType.width,
		height:    bulletType.height,
		damage:    bulletType.damage,
		name:      bulletType.name,
	}
}

// Updates a bullets position to the given x and y coordinates
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
