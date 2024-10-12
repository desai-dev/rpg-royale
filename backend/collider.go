package main

type Collider interface {
	Position() Position
	Width() float64
	Height() float64
}

// Detects collisions between two Collider objects
func CheckCollision[A Collider, B Collider](a A, b B) bool {
	ax, ay := a.Position().X, a.Position().Y
	aw, ah := a.Width(), a.Height()
	bx, by := b.Position().X, b.Position().Y
	bw, bh := b.Width(), b.Height()

	// Check for collision
	return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by
}
