const TABLE_CENTER = { x: 50, y: 50 };

export function generateSeats(count: number): { x: number; y: number }[] {
  const n = Math.min(Math.max(count, 1), 10);
  const seats: { x: number; y: number }[] = [];
  const cx = 50, cy = 48;
  const rx = 44, ry = 44;
  const startAngle = -Math.PI / 2;
  for (let i = 0; i < n; i++) {
    const angle = startAngle + (2 * Math.PI * i) / n;
    seats.push({
      x: Math.round(cx + rx * Math.cos(angle)),
      y: Math.round(cy + ry * Math.sin(angle)),
    });
  }
  return seats;
}

export function getCardOffset(seatX: number, seatY: number): { dx: number; dy: number } {
  const dirX = TABLE_CENTER.x - seatX;
  const dirY = TABLE_CENTER.y - seatY;
  const len = Math.sqrt(dirX * dirX + dirY * dirY);
  if (len === 0) return { dx: 0, dy: 0 };
  const scale = 85 / len;
  return { dx: dirX * scale, dy: dirY * scale };
}
