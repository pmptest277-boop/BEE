import { startGame } from './game.js';

const canvas = document.querySelector('#gameCanvas');
const scoreEl = document.querySelector('#score');
const livesEl = document.querySelector('#lives');
const messageEl = document.querySelector('#message');
const restartButton = document.querySelector('#restartButton');

startGame({ canvas, scoreEl, livesEl, messageEl, restartButton });
