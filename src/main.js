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
var my = {sprite: {}, text: {}, log: []};
const enumList = {
    RIGHT: 1,
    LEFT: -1,
    SHOOTING: 0,
    JUMPING: 2,
    GROUNDED: 3,
    INAIR: 4,
    NOJUMP: 5
};

const debugText = "Debug mode activated!" +
        "\nDebug keys are now active:" +
        "\nP: Teleport to map" +
        "\nM: Reveal entire map" +
        "\nC: Print player map coordinates" +
        "\nU: Disable gun cooldown" +
        "\n0: Reduce Timer by 75" +
        "\n1: Display generation log" +
        "\nO: Spawn Pickup";




const game = new Phaser.Game(config);

//debug print screen size
if (game.config.physics.arcade.debug) {
    console.log(debugText);

    console.log("DB: Window Inner Height:" + window.innerHeight);
    console.log("DB: Window Inner Width:" + window.innerWidth);
    console.log("DB:Device Pixel Ratio:" + window.devicePixelRatio);
}