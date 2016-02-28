/// <reference path="./defs/jquery/jquery.d.ts" />

/// <reference path="./defs/hammer/hammer.d.ts" />

/// <reference path="./assetManager.ts" />
/// <reference path="./gameObject.ts" />
/// <reference path="./playScreen.ts" />
/// <reference path="./settingsScreen.ts" />
/// <reference path="./loadingScreen.ts" />
/// <reference path="./startScreen.ts" />
/// <reference path="./threeItem.ts" />
/// <reference path="./control.ts" />
/// <reference path="./fallingItem.ts" />

import * as Hammer from "hammerjs";
import * as THREE from "three";
import * as $ from "jquery";


import AssetManager = require("./assetManager");
import GameObject = require("./gameObject");
import GameScreen = require("./settingsScreen");
import GameScreen = require("./startScreen");
import GameScreen = require("./loadingScreen");
import GameScreen = require("./playScreen");
import ThreeItem = require("./threeItem");
import Candy = require("./candy");
import Control = require("./control");
import FallingItem = require("./fallingItem");

let game;


let playScreen;
let loadingScreen;
let startScreen;
let settingsScreen;
let threeItem;
let clock;
const dt = 1 / 60;
const xPositions = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
const numBlocksWide = 10;
const blockWidth = 1;
let controls = { leftButton: null, downButton: null, rightButton: null };
const width = 20;
let hammer; // use to catch mouse and touch events with Hammer
let time;
let delta;

$(() => {
    console.log("jquery & underscore loaded1.");
    hammer = new Hammer(document.body);
    hammer.on("tap", function(event) {
        hammerEventReceived(event);
    });
    hammer.on("press", function(event) {
        console.log("press");
        hammerEventReceived(event);
    });
    hammer.on("pressup", function(event) {
        console.log("press up");
        hammerEventReceived(event);
    });
    createGame();
});

function createGame() {

    game = new GameObject.Game(THREE);

    // create the screens
    playScreen = new PlayScreen();
    startScreen = new StartScreen();
    settingscreen = new SettingsScreen();
    loadingScreen = new LoadingScreen();

    // loadingScreen.show();
    GameScreen.Screen.setCurrentcreen(loadingScreen);
    AssetManager.AssetManager.loadAssets(
        function(){
            console.log("loaded");
        },
        function () {
            console.log("finished");
            GameScreen.Screen.setCurrentcreen(playScreen);
        });

    let render = function() {

        requestAnimationFrame(render);
        Candy.Candy.update(game.clock.getDelta(), game.clock.getElapsedTime());

        switch (GameScreen.Screen.getCurrentScreen().name) {
            case "playScreen":
                if (FallingItem.FallingItem.getNumFallingItemsMoving() <= 0) {
                    createFallingItem(screen
                    );
                }
            break;
        }

        game.render(GameScreen.Screen.getCurrentScreen());
        // kill a random FallingItem to test if FallingItems drop after the one under them is removed from the screen
        // FallingItem.FallingItem.killRandom();
    };

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
            screen : playScreen,
            customMaterial: true
        });

    playScreen.add(candy);
}


/*******************************************************************
 * Create the start screen
 */
function buildLoadingScreen() {
    loadingScreen = new GameScreen.Screen({
        width: width,
        height: 9 * width / 6,
        name: "loadingScreen",
        overlay: "loadingOverlay",
        // order: 1
    });
}

/*******************************************************************
 * Create the start screen
 */
function buildStartScreen() {
    startScreen = new GameScreen.Screen({
        width: width,
        height: 9 * width / 6,
        name: "startScreen",
        overlay: "startOverlay",
        order: 0
    });
}

/**************************************************************************
 * Create the settings screen
 */
function buildSettingsScreen() {
    settingsScreen = new GameScreen.Screen({
        width: width,
        height: 9 * width / 6,
        name: "settingsScreen",
        overlay: "settingsOverlay",
        // order: 4
    });
}

/****************************************************************
 * Create the action screen
 */
function buildPlayScreen() {
    playScreen = new GameScreen.Screen({
        width: width,
        height: 9 * width / 6,
        name: "playScreen",
        overlay: "playScreenOverlay",
        order: 1
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
        screen : playScreen
    });
    playScreen.add(ground);

    // create controls
    controls.leftButton = new Control.Control("circle", "leftButton", new THREE.Vector3(-4, -3, 2), {
        size: 1.5,
        segments: 32,
        color: new THREE.Color("rgb(140,140,0)")
    });
    controls.downButton = new Control.Control("circle", "downButton", new THREE.Vector3(0, -3, 2), {
        size: 1.5,
        segments: 32,
        color: new THREE.Color("rgb(140,140,0)")
    });
    controls.rightButton = new Control.Control("circle", "rightButton", new THREE.Vector3(4, -3, 2), {
        size: 1.5,
        segments: 32,
        color: new THREE.Color("rgb(140,140,0)")
    });

    for (let control in controls) {
        if (controls.hasOwnProperty(control)) {
            playScreen.add(controls[control]);
        }
    }

    // center the camera
    playScreen.positionCamera(null, 10, 10);
}

/***********************************************************************
 * User defined event handlers
 */
function hammerEventReceived(event) {
    // output the type of event it was
    // console.log(event.srcEvent + " received");
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
    // console.log("world Coords: " + worldCoords.x + ", " + worldCoords.y);

    let raycaster = new THREE.Raycaster(); // create once
    // raycasting code from each camera copied from here:
    // http://stackoverflow.com/questions/25024044/three-js-raycasting-with-camera-as-origin
    if (playScreen.camera instanceof THREE.OrthographicCamera) {
        worldCoords.unproject( playScreen.camera );
        let dir = new THREE.Vector3;
        dir.set( 0, 0, - 1 ).transformDirection( playScreen.camera.matrixWorld );
        raycaster.set( worldCoords, dir );
    }
    // TODO: raycaster does not work with perspective camera
    else if ( playScreen
    .camera instanceof THREE.PerspectiveCamera ) {
        worldCoords.unproject( playScreen.camera );
        raycaster.set( playScreen.camera.position, worldCoords.sub( playScreen.camera.position ).normalize());
    }

    let intersectionArray = raycaster.intersectObjects(Control.Control.meshes);
    if (intersectionArray.length > 0 ) {
        resolveControlInteraction(intersectionArray);
    }

}

// /****************************************************
//  * press event received
//  */
// function pressReceived(event) {
//     console.log (event.type);
//      let worldCoords = convertCoordsToThreescreen
//         (new THREE.Vector2(event.center.x, event.center.y));

//         let raycaster = new THREE.Raycaster(); // create once
//         // raycasting code from each camera copied from here:
//         // http://stackoverflow.com/questions/25024044/three-js-raycasting-with-camera-as-origin
//         if (playScreen.camera instanceof THREE.OrthographicCamera) {
//             worldCoords.unproject( playScreen.camera );
//             let dir = new THREE.Vector3;
//             dir.set( 0, 0, - 1 ).transformDirection( playScreen.camera.matrixWorld );
//             raycaster.set( worldCoords, dir );
//         }
//         // TODO: raycaster does not work with perspective camera
//         else if ( playScreen
//         .camera instanceof THREE.PerspectiveCamera ) {
//             worldCoords.unproject( playScreen.camera );
//             raycaster.set( playScreen.camera.position, worldCoords.sub( playScreen.camera.position ).normalize());
//         }

//         let intersectionArray = raycaster.intersectObjects(Control.Control.meshes);
//         if (intersectionArray.length > 0 ) {
//             resolveControlInteraction(intersectionArray);
//         }

// }
// function pressupReceived(event) {
// }

function convertCoordsToThreescreen
(coords: THREE.Vector2) {
    let worldCoords = new THREE.Vector3(
        (coords.x / window.innerWidth) * 2 - 1,
        - (coords.y / window.innerHeight) * 2 + 1,
        -1);

    return worldCoords;
}

function resolveControlInteraction(intersectedObjects) {
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
                FallingItem.FallingItem.moveQueue.push("left");
            break;
            case "rightButton":
                console.log("right");
                FallingItem.FallingItem.moveQueue.push("right");
            break;
            case "downButton":
                console.log("down");
                FallingItem.FallingItem.fallFaster = !FallingItem.FallingItem.fallFaster;
            break;
        }
    }
}