export const CONFIG = {
  canvasWidth: 640,
  canvasHeight: 480,
  playerSpeed: 6,
  bulletSpeed: 8,
  enemyRows: 4,
  enemyCols: 8,
  enemyGapX: 14,
  enemyGapY: 12,
  enemyWidth: 36,
  enemyHeight: 24,
  enemySpeed: 1,
  enemyDrop: 20,
  maxLives: 3
};

export function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function createInitialState() {
  return {
    score: 0,
    lives: CONFIG.maxLives,
    isGameOver: false,
    player: {
      width: 42,
      height: 22,
      x: CONFIG.canvasWidth / 2 - 21,
      y: CONFIG.canvasHeight - 44
    },
    bullets: [],
    enemies: createEnemies(),
    enemyDirection: 1
  };
}

export function createEnemies() {
  const formationWidth =
    CONFIG.enemyCols * CONFIG.enemyWidth + (CONFIG.enemyCols - 1) * CONFIG.enemyGapX;
  const startX = (CONFIG.canvasWidth - formationWidth) / 2;

  const enemies = [];
  for (let row = 0; row < CONFIG.enemyRows; row += 1) {
    for (let col = 0; col < CONFIG.enemyCols; col += 1) {
      enemies.push({
        x: startX + col * (CONFIG.enemyWidth + CONFIG.enemyGapX),
        y: 60 + row * (CONFIG.enemyHeight + CONFIG.enemyGapY),
        width: CONFIG.enemyWidth,
        height: CONFIG.enemyHeight,
        alive: true
      });
    }
  }
  return enemies;
}

export function increaseScore(currentScore, points = 100) {
  return currentScore + points;
}

export function loseLife(currentLives) {
  return Math.max(0, currentLives - 1);
}

export function updateEnemyFormation(enemies, direction) {
  const aliveEnemies = enemies.filter((enemy) => enemy.alive);
  if (!aliveEnemies.length) {
    return { enemies, direction };
  }

  const leftMost = Math.min(...aliveEnemies.map((enemy) => enemy.x));
  const rightMost = Math.max(...aliveEnemies.map((enemy) => enemy.x + enemy.width));

  let nextDirection = direction;
  let shouldDrop = false;

  if (rightMost >= CONFIG.canvasWidth - 4 && direction > 0) {
    nextDirection = -1;
    shouldDrop = true;
  } else if (leftMost <= 4 && direction < 0) {
    nextDirection = 1;
    shouldDrop = true;
  }

  const nextEnemies = enemies.map((enemy) => {
    if (!enemy.alive) {
      return enemy;
    }

    return {
      ...enemy,
      x: enemy.x + CONFIG.enemySpeed * nextDirection,
      y: enemy.y + (shouldDrop ? CONFIG.enemyDrop : 0)
    };
  });

  return { enemies: nextEnemies, direction: nextDirection };
}
