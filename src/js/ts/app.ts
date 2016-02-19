/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./gameObject.ts" />
/// <reference path="./gameScene.ts" />
/// <reference path="./threeItem.ts" />

import * as THREE from "three";
import * as $ from "jquery";
import * as _ from "underscore";

import GameObject = require("./gameObject");
import GameScene = require("./gameScene");
import ThreeItem = require("./threeItem");
import Candy = require("./candy");

var CANNON;
var game;
var dt = 1 / 60;
var xPositions =[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
var numBlocksWide = 10;
var blockWidth = 1;

$(() => {
    console.log("jquery & underscore loaded1");

    createGame();
});

var width = 20;
function createGame(){
    game = new GameObject.Game(THREE);
    var scene = new GameScene.Scene({
        width: width,
        height: 9 * width / 6
    });

    // create the ground
    var ground = new ThreeItem.Box({
       width: 20,
       height: .5,
       depth: 20,
       x: 0,
       y: -10,
       z: 0,
       color: new THREE.Color("rgb(0,140,0)"),
       name: "ground",
       movementStatus: "unmovable",  // the ground stays still
       scene: scene
    });
    scene.add(ground);

    scene.positionCamera(null, null, 5);
    var render = function () {
        requestAnimationFrame( render );
        // ThreeItem.ThreeItem.update();
        Candy.Candy.update();

        if (ThreeItem.Box.getNumBoxesMoving() <= 0){
             createBox(scene);
        }

        game.render(scene);
        // kill a random box to test if boxes drop after the one under them is removed from the scene
        ThreeItem.Box.killRandom();
    };
     createBox(scene);
    render();
}

function createBox(scene) {
    var min = 0; // left bound
    var max = xPositions.length;  // right bound
    // get random number between them
    var xPos = xPositions[Math.floor(Math.random() * (max -min) + min )];

    //console.log(xPos);
    var candy = new Candy.Candy(
    {
        width: blockWidth,
        x: xPos,
        y: 10,
        name: "candy",
        scene: scene
    });
 
    scene.add(candy);
}
