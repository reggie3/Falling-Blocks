/// <reference path="./defs/jquery/jquery.d.ts" />
/// <reference path="./defs/underscore/underscore.d.ts" />
/// <reference path="./defs/hammer/hammer.d.ts" />


/// <reference path="./gameObject.ts" />
/// <reference path="./gameScreen.ts" />
/// <reference path="./threeItem.ts" />
/// <reference path="./control.ts" />
/// <reference path="./fallingItem.ts" />

import * as Hammer from "hammerjs";
import * as THREE from "three";
import * as $ from "jquery";
import * as _ from "underscore";

import GameObject = require("./gameObject");
import GameScreen = require("./gameScreen");
import ThreeItem = require("./threeItem");
import Candy = require("./candy");
import Control = require("./control");
import FallingItem = require("./fallingItem");

let game;
let screen;
let threeItem;
let clock;
const dt = 1 / 60;
const xPositions = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
const numBlocksWide = 10;
const blockWidth = 1;
let controls = { leftButton: null, rightButton: null };
const width = 20;
let hammer; // use to catch mouse and touch events with Hammer
let time;
let delta;

$(() => {
    console.log("jquery & underscore loaded1.");
    hammer = new Hammer(document.body);
    hammer.on("tap", function(event) {
        tapReceived(event);
    });
    createGame();
});


function createGame() {

    game = new GameObject.Game(THREE);
    screen
     = new GameScreen.Screen({
        width: width,
        height: 9 * width / 6
    });

    // create the ground
    let ground = new FallingItem.FallingItem({
        width: 11,
        height: 1,
        depth: 1,
        x: 0,
        y: -.5,
        z: 0,
        color: new THREE.Color("rgb(0,140,0)"),
        name: "ground",
        movementStatus: "unmovable",  // the ground stays still.
        screen : screen

    });
    screen
    .add(ground);

    // create controls
    controls.leftButton = new Control.Control("circle", "leftButton", new THREE.Vector3(-2, -3, 2), {
        size: 1.5,
        segments: 32,
        color: new THREE.Color("rgb(140,140,0)")
    });
    controls.rightButton = new Control.Control("circle", "rightButton", new THREE.Vector3(2, -3, 2), {
        size: 1.5,
        segments: 32,
        color: new THREE.Color("rgb(140,140,0)")
    });

    for (let control in controls) {
        if (controls.hasOwnProperty(control)) {
            screen
            .add(controls[control]);
        }
    }

    // center the camera
    screen.positionCamera(null, 10, 10);

    let render = function() {
        delta = game.getDelta();

        requestAnimationFrame(render);
        Candy.Candy.update(delta, game.clock.getElapsedTime());

        if (FallingItem.FallingItem.getNumFallingItemsMoving() <= 0) {
            createFallingItem(screen
            );
        }

        game.render(screen);
        // kill a random FallingItem to test if FallingItems drop after the one under them is removed from the screen

        FallingItem.FallingItem.killRandom();
    };
    createFallingItem(screen
    );
    render();
}

function createFallingItem(screen) {
    let min = 0; // left bound
    let max = xPositions.length;  // right bound
    // get random number between them
    let xPos = xPositions[Math.floor(Math.random() * (max - min) + min)];

    // console.log(xPos);
    let candy = new Candy.Candy(
        {
            width: blockWidth,
            x: xPos,
            y: 30,
            name: "candy",
            screen
            : screen

        });

    screen
    .add(candy);
}

function tapReceived(event) {
    // output the type of event it was
    //console.log(event.srcEvent + " received");
    let tapPoint = new THREE.Vector2();
    switch (event.pointerType) {
        case "touch":
        case "mouse":
            tapPoint.x = event.center.x;
            tapPoint.y = event.center.y;
            break;
    }
    // console.log("touchpoint " + tapPoint.x + ", " + tapPoint.y);
    let worldCoords = convertCoordsToThreescreen
    (new THREE.Vector2(tapPoint.x, tapPoint.y));
    //console.log("world Coords: " + worldCoords.x + ", " + worldCoords.y);

    let raycaster = new THREE.Raycaster(); // create once
    // raycasting code from each camera copied from here:
    // http://stackoverflow.com/questions/25024044/three-js-raycasting-with-camera-as-origin
    if (screen
    .camera instanceof THREE.OrthographicCamera) {
         worldCoords.unproject( screen
         .camera );
        let dir = new THREE.Vector3;
        dir.set( 0, 0, - 1 ).transformDirection( screen
        .camera.matrixWorld );
        raycaster.set( worldCoords, dir );
    }
    // TODO: raycaster does not work with perspective camera
    else if ( screen
    .camera instanceof THREE.PerspectiveCamera ) {
        worldCoords.unproject( screen
        .camera );
        raycaster.set( screen
        .camera.position, worldCoords.sub( screen
        .camera.position ).normalize());
    }

    let intersectionArray = raycaster.intersectObjects(Control.Control.meshes);
    if (intersectionArray.length > 0 ) {
        resolvedTap(intersectionArray);
    }

}

function convertCoordsToThreescreen
(coords: THREE.Vector2) {
    let worldCoords = new THREE.Vector3(
        (coords.x / window.innerWidth) * 2 - 1,
        - (coords.y / window.innerHeight) * 2 + 1,
        -1);

    return worldCoords;
}

function resolvedTap(intersectedObjects) {
    // for (let i = 0; i < intersectedObjects.length; i++) {
    //     // if a userData has a controlID member then we clicked on a control
    //     if (intersectedObjects[i].object.userData.controlID) {

    //     }
    // }
    if (intersectedObjects[0].object.userData.hasOwnProperty("controlID")) {
        // get the control name
        let controlName = Control.Control.getControlByID( intersectedObjects[0].object.userData.controlID ).name;
        switch (controlName) {
            case "leftButton":
                console.log("left");
                FallingItem.FallingItem.addMove("left");
            break;
            case "rightButton":
                console.log("right");
                FallingItem.FallingItem.addMove("right");
            break;
        }
    }
}