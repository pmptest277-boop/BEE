import {
  CONFIG,
  createInitialState,
  increaseScore,
  intersects,
  loseLife,
  updateEnemyFormation
} from './gameLogic.js';

export function startGame({ canvas, scoreEl, livesEl, messageEl, restartButton }) {
  const ctx = canvas.getContext('2d');
  let state = createInitialState();
  const keys = { left: false, right: false };
  let animationFrameId = null;
  let isRunning = true;

  function resetGame() {
    state = createInitialState();
    updateHud();
    messageEl.textContent = 'Use ← / → to move, Space to shoot.';
    restartButton.hidden = true;
  }

  function updateHud() {
    scoreEl.textContent = String(state.score);
    livesEl.textContent = String(state.lives);
  }

  function shoot() {
    if (state.isGameOver) {
      return;
    }

    if (state.bullets.length > 5) {
      return;
    }

    state.bullets.push({
      x: state.player.x + state.player.width / 2 - 2,
      y: state.player.y,
      width: 4,
      height: 12
    });
  }

  function onKeyDown(event) {
    if (event.code === 'ArrowLeft') keys.left = true;
    if (event.code === 'ArrowRight') keys.right = true;
    if (event.code === 'Space') {
      event.preventDefault();
      shoot();
    }
  }

  function onKeyUp(event) {
    if (event.code === 'ArrowLeft') keys.left = false;
    if (event.code === 'ArrowRight') keys.right = false;
  }

  function processCollisions() {
    state.bullets = state.bullets.filter((bullet) => {
      let hit = false;

      for (const enemy of state.enemies) {
        if (enemy.alive && intersects(bullet, enemy)) {
          enemy.alive = false;
          state.score = increaseScore(state.score, 100);
          hit = true;
          break;
        }
      }

      return !hit;
    });

    updateHud();

    if (state.enemies.every((enemy) => !enemy.alive)) {
      messageEl.textContent = 'You win! Restart to play again.';
      state.isGameOver = true;
      restartButton.hidden = false;
    }
  }

  function processEnemyDanger() {
    const reachedBottom = state.enemies.some(
      (enemy) => enemy.alive && enemy.y + enemy.height >= state.player.y
    );

    if (!reachedBottom) {
      return;
    }

    state.lives = loseLife(state.lives);
    updateHud();

    if (state.lives === 0) {
      state.isGameOver = true;
      messageEl.textContent = 'Game Over';
      restartButton.hidden = false;
      return;
    }

    state.enemies = state.enemies.map((enemy) => ({
      ...enemy,
      y: enemy.y - CONFIG.enemyDrop * 2
    }));
    messageEl.textContent = `Ouch! Lives left: ${state.lives}`;
  }

  function update() {
    if (state.isGameOver) {
      return;
    }

    if (keys.left) {
      state.player.x = Math.max(0, state.player.x - CONFIG.playerSpeed);
    }
    if (keys.right) {
      state.player.x = Math.min(
        CONFIG.canvasWidth - state.player.width,
        state.player.x + CONFIG.playerSpeed
      );
    }

    state.bullets = state.bullets
      .map((bullet) => ({ ...bullet, y: bullet.y - CONFIG.bulletSpeed }))
      .filter((bullet) => bullet.y + bullet.height > 0);

    const enemyUpdate = updateEnemyFormation(state.enemies, state.enemyDirection);
    state.enemies = enemyUpdate.enemies;
    state.enemyDirection = enemyUpdate.direction;

    processCollisions();
    processEnemyDanger();
  }

  function drawPlayer() {
    ctx.fillStyle = '#8de76d';
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
  }

  function drawBullets() {
    ctx.fillStyle = '#f8f38d';
    for (const bullet of state.bullets) {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  function drawEnemies() {
    for (const enemy of state.enemies) {
      if (!enemy.alive) {
        continue;
      }
      ctx.fillStyle = '#f9b851';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.fillStyle = '#1a1201';
      ctx.fillRect(enemy.x + 6, enemy.y + 7, 6, 6);
      ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + 7, 6, 6);
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
  }

  function loop() {
    if (!isRunning) {
      return;
    }

    update();
    render();
    animationFrameId = requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  restartButton.addEventListener('click', resetGame);

  updateHud();
  loop();

  return {
    stop() {
      isRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      restartButton.removeEventListener('click', resetGame);
    }
  };
}
