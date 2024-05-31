//An ode to a real one:
// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"
// game config
let config = {
    parent: 'phaser-game',
    //type: Phaser.CANVAS,
    type: Phaser.WEBGL,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    //fps: { forceSetTimeOut: true, target: 30 },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            fps: 60,//I am officially leaving this at 60
            fixedstep: true,
            tileBias: 64,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width:  1200,//window.innerWidth * window.devicePixelRatio
    height: 700,//window.innerHeight * window.devicePixelRatio,
    scene: [Load, Platformer, GameOver]
}

var cursors;
var experimental = {
    width: -1,
    height: -1,
    branches: -1
}
const SCALE = 2.0;
var my = {sprite: {}, text: {}};
const enumList = {
    RIGHT: 1,
    LEFT: -1,
    SHOOTING: 0,
    JUMPING: 2,
    GROUNDED: 3,
    INAIR: 4,
    NOJUMP: 5
};
console.log(window.innerHeight);
console.log(window.innerWidth);
console.log(window.devicePixelRatio);
const game = new Phaser.Game(config);
