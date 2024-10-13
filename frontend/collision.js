export function checkCollision(a, b) {
  const ax = a.position.x;
  const ay = a.position.y;
  const aw = a.width;
  const ah = a.height;

  const bx = b.position.x;
  const by = b.position.y;
  const bw = b.width;
  const bh = b.height;

  // Check for collision 
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}