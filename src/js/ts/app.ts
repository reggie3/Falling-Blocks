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
/// <reference path="./controls.ts" />
/// <reference path="./fallingItem.ts" />

import * as Hammer from "hammerjs";
import * as THREE from "three";
import * as $ from "jquery";


import AssetManager = require("./assetManager");
import GameObject = require("./gameObject");
import GameScreen = require("./gameScreen");
import SettingsScreen = require("./settingsScreen");
import CreditsScreen = require("./creditsScreen");
import StartScreen = require("./startScreen");
import LoadingScreen = require("./loadingScreen");
import PlayScreen = require("./playScreen");

import Candy = require("./candy");
import Controls = require("./controls");
import FallingItem = require("./fallingItem");

let game;   // game object
let screens = {
    playScreen: null,
    loadingScreen: null,
    startScreen: null,
    settingsScreen: null,
    creditsScreen: null
};

let clock;

const xPositions = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
const numBlocksOnPlayfield = 10;
const numBlocksAcrossScene = 20;
let blockWidth = 10;



$(() => {
    console.log("starting game");

    createGame();
});

function createGame() {
    GameScreen.Screen.init();
    game = new GameObject.Game(GameScreen.Screen.getWidth(), GameScreen.Screen.getHeight());
    blockWidth = Math.floor(GameScreen.Screen.getWidth() / numBlocksAcrossScene);

    // load the loading screen first, and pass it a callback that loads and creates everything else
    screens.loadingScreen = new LoadingScreen.LoadingScreen({
        name: "loadingScreen",
        overlay: "loadingOverlay",
        // order: 1,
        blockWidth: blockWidth,
        screenDim : {
            width: GameScreen.Screen.getWidth(),
            height: GameScreen.Screen.getHeight()
        },
        nextScreen: screens.playScreen
    }, doPreloadAndCreateScreens);

    // show the loading screen
    GameScreen.Screen.setCurrentcreen(screens.loadingScreen);

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
                screens.loadingScreen.update(game.clock.getDelta(), game.clock.getElapsedTime());
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
             screens.loadingScreen.initProgressBar(numberAssets + (Object.keys(screens).length - 1));
        },
        function() {    // called when each asset is loaded
             screens.loadingScreen.updateProgress(1);
        },
        function() {
            console.log("finished");
            // create the screens
            screens.playScreen = new PlayScreen.PlayScreen({
                name: "playScreen",
                overlay: "playScreenOverlay",
                order: 1,
                blockWidth: blockWidth,
                prevScreen: screens.loadingScreen
            });
             screens.loadingScreen.updateProgress(1);
            screens.startScreen = new StartScreen.StartScreen({
                name: "startScreen",
                overlay: "startOverlay",
                order: 0,
                blockWidth: blockWidth
            });
             screens.loadingScreen.updateProgress(1);
            screens.settingsScreen = new SettingsScreen.SettingsScreen({
                name: "settingsScreen",
                overlay: "settingsOverlay",
                // order: 4,
                blockWidth: blockWidth
            });
            screens.loadingScreen.updateProgress(1);

            screens.creditsScreen = new CreditsScreen.CreditsScreen({
                name: "creditsScreen",
                overlay: "creditsOverlay",
                // order: 4,
                blockWidth: blockWidth
            });
            screens.loadingScreen.updateProgress(1);

            // set up the next and prev screens for the individual screens
            screens.loadingScreen.nextScreen = screens.playScreen;
            screens.playScreen.prevScreen = screens.loadingScreen;
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
            screen: screens.playScreen,
            customMaterial: true
        });

    screens.playScreen.add(candy);
}
