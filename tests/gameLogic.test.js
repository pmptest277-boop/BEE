import { describe, expect, it } from 'vitest';
import {
  CONFIG,
  createInitialState,
  increaseScore,
  intersects,
  loseLife,
  updateEnemyFormation
} from '../src/gameLogic.js';

describe('Bee Shooter game logic', () => {
  it('detects collision when rectangles overlap', () => {
    const bullet = { x: 10, y: 10, width: 5, height: 10 };
    const enemy = { x: 8, y: 15, width: 20, height: 20 };
    expect(intersects(bullet, enemy)).toBe(true);
  });

  it('adds score with default points', () => {
    expect(increaseScore(200)).toBe(300);
    expect(increaseScore(200, 50)).toBe(250);
  });

  it('decreases lives without going below zero', () => {
    expect(loseLife(3)).toBe(2);
    expect(loseLife(0)).toBe(0);
  });

  it('resets state correctly on re-initialization', () => {
    const state = createInitialState();
    state.score = 900;
    state.lives = 1;
    state.enemies[0].alive = false;

    const resetState = createInitialState();
    expect(resetState.score).toBe(0);
    expect(resetState.lives).toBe(CONFIG.maxLives);
    expect(resetState.enemies.every((enemy) => enemy.alive)).toBe(true);
  });

  it('moves enemies and drops them when touching right boundary', () => {
    const enemies = [
      { x: CONFIG.canvasWidth - CONFIG.enemyWidth - 2, y: 80, width: CONFIG.enemyWidth, height: CONFIG.enemyHeight, alive: true }
    ];

    const next = updateEnemyFormation(enemies, 1);
    expect(next.direction).toBe(-1);
    expect(next.enemies[0].y).toBe(80 + CONFIG.enemyDrop);
    expect(next.enemies[0].x).toBe(enemies[0].x - CONFIG.enemySpeed);
  });
});
