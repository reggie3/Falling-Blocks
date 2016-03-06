/// <reference path="./defs/jquery/jquery.d.ts" />

/// <reference path="./defs/hammer/hammer.d.ts" />

/// <reference path="./assetManager.ts" />
/// <reference path="./gameObject.ts" />
/// <reference path="./gameScreen.ts" />
/// <reference path="./settingsScreen.ts" />
/// <reference path="./playScreen.ts" />

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
import GameScreen = require("./gameScreen");
import SettingsScreen = require("./settingsScreen");
import StartScreen = require("./startScreen");
import LoadingScreen = require("./loadingScreen");
import PlayScreen = require("./playScreen");
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
const numBlocksOnPlayfield = 10;
const numBlocksAcrossScene = 20;
let blockWidth = 10;

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
    GameScreen.Screen.init();
    game = new GameObject.Game(GameScreen.Screen.getWidth(), GameScreen.Screen.getHeight());
    blockWidth = Math.floor(GameScreen.Screen.getWidth() / numBlocksAcrossScene);

    // load the loading screen first, and pass it a callback that loads and creates everything else
    loadingScreen = new LoadingScreen.LoadingScreen({
        name: "loadingScreen",
        overlay: "loadingOverlay",
        // order: 1,
        blockWidth: blockWidth,
        screenDim : {
            width: GameScreen.Screen.getWidth(),
            height: GameScreen.Screen.getHeight()
        }
    }, doPreloadAndCreateScreens);

    // show the loading screen
    GameScreen.Screen.setCurrentcreen(loadingScreen);

    // render loop
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
            case "loadingScreen":
                loadingScreen.update(game.clock.getDelta(), game.clock.getElapsedTime());
            break;
        }

        game.render(GameScreen.Screen.getCurrentScreen());
        // kill a random FallingItem to test if FallingItems drop after the one under them is removed from the screen
        // FallingItem.FallingItem.killRandom();
    };

    render();
}

// do all the presload tasks (create screens, objects, etc.)
function doPreloadAndCreateScreens() {
    AssetManager.AssetManager.loadAssets(
        function(numberAssets) {    // asset loaded update function
            console.log(numberAssets + " assets");

            // the loading screen progress bar will increment for each asset and each of the screens
             loadingScreen.initProgressBar(numberAssets + 3);
        },
        function() {    // called when each asset is loaded
             loadingScreen.updateProgress(1);
        },
        function() {
            console.log("finished");
            // create the screens
            playScreen = new PlayScreen.PlayScreen({
                name: "playScreen",
                overlay: "playScreenOverlay",
                order: 1,
                blockWidth: blockWidth
            });
             loadingScreen.updateProgress(1);
            startScreen = new StartScreen.StartScreen({
                name: "startScreen",
                overlay: "startOverlay",
                order: 0,
                blockWidth: blockWidth
            });
             loadingScreen.updateProgress(1);
            settingsScreen = new SettingsScreen.SettingsScreen({
                name: "settingsScreen",
                overlay: "settingsOverlay",
                // order: 4,
                blockWidth: blockWidth
            });
            loadingScreen.updateProgress(1);
            // automatically jump to the game play screen after all the assets are loaded
            // GameScreen.Screen.setCurrentcreen(playScreen);
        });
}

function createFallingItem(screen) {
    let min = 0; // left bound
    let max = xPositions.length;  // right bound
    // get random number between them
    let xPos = blockWidth * xPositions[Math.floor(Math.random() * (max - min) + min)];

    // console.log(xPos);
    let candy = new Candy.Candy(
        {
            width: blockWidth, height: blockWidth, depth: blockWidth,
            x: xPos,
            y: 20 * blockWidth,
            name: "candy",
            screen: playScreen,
            customMaterial: true
        });

    playScreen.add(candy);
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
        worldCoords.unproject(playScreen.camera);
        let dir = new THREE.Vector3;
        dir.set(0, 0, - 1).transformDirection(playScreen.camera.matrixWorld);
        raycaster.set(worldCoords, dir);
    }
    // TODO: raycaster does not work with perspective camera
    else if (playScreen
        .camera instanceof THREE.PerspectiveCamera) {
        worldCoords.unproject(playScreen.camera);
        raycaster.set(playScreen.camera.position, worldCoords.sub(playScreen.camera.position).normalize());
    }

    let intersectionArray = raycaster.intersectObjects(Control.Control.meshes);
    if (intersectionArray.length > 0) {
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
        let controlName = Control.Control.getControlByID(intersectedObjects[0].object.userData.controlID).name;
        switch (controlName) {
            case "leftButton":
                console.log("left");
                FallingItem.FallingItem.addMove("left");
                break;
            case "rightButton":
                console.log("right");
                FallingItem.FallingItem.addMove("right");
                break;
            case "downButton":
                console.log("down");
                FallingItem.FallingItem.fallFaster = !FallingItem.FallingItem.fallFaster;
                break;
        }
    }
}