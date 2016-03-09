


import * as THREE from "three";
import GameScreen = require("./gameScreen");
import AssetManager = require("./assetManager");
import Utils = require("./utils");
import Controls = require("./controls");
import App = require("./app");


export class LoadingScreen extends GameScreen.Screen {
    static curProgressCounter = 0;
    static prevProgressCounter = 0;

    currentPgBar;

    pgBar = {
        mesh: null,
        geometry: null,
        material: null,
        numberItems: 0,
        width: 1,
        height: 25
    };
    textGeo;
    textMesh;
    textMat;
    callback;
    bg = {
        mesh: null,
        geo: null,
        mat: null,
    };
    pgTex;
    startButton;
    // the state of this loading screen
    //  loading1 - loading assets for this loading screen
    //  loaded1 - assets for this loading screen are loaded
    //  loading2 - loading rest of game assets
    //  loaded2 - rest of game assets have been loaded
    screenState = "loading1";

    // this is the number of things that need to be loaded for this screen
    numThingsToLoad: number = 3;
    itemsLoaded: number = 0;    // track the number of things that have been loaded

    minX = -100;   // the width of the pogress bar will be twice the absolute value of this number
    numIncrements = 4;
    touchableMeshes = []; // an array of touchable meshes



    constructor(options, callback) {
        super(options);

        this.callback = callback;

        this.loadLocalAssets();

    }

    loadLocalAssets () {
        // load a font for use on this screen
        let loader = new THREE.FontLoader();
        let that = this;    // for access in the anonymous callback functions below
        loader.load(AssetManager.AssetManager.assets.helvetiker_regular.source,
            function(response) {
                AssetManager.AssetManager.assets.helvetiker_regular.font = response;
                this.textGeo = new THREE.TextGeometry("Please Wait", {
                    font: AssetManager.AssetManager.assets.helvetiker_regular.font,
                    size: 25,
                    height: 0,
                    curveSegments: 48,
                    bevelEnabled: false
                });
                THREE.GeometryUtils.center(this.textGeo);
                this.textMat = new THREE.MeshBasicMaterial({});
                this.textMesh = new THREE.Mesh(this.textGeo, this.textMat);
                this.textMesh.position.y = 20;
                this.scene.add(this.textMesh);
                this.itemsLoaded++;
                this.checkIfFinished(this.callback);

            }.bind(this));

        let texLoader = new THREE.TextureLoader();
        texLoader.load(AssetManager.AssetManager.assets.blueProgressBar.source,
            // Function when resource is loaded
            function(texture) {
                AssetManager.AssetManager.assets.blueProgressBar.material = texture;
                this.pgTex = texture;
                this.itemsLoaded++;
                this.checkIfFinished(this.callback);
            }.bind(this));

        texLoader.load(AssetManager.AssetManager.assets.bkgLoading.source,
            // Function when resource is loaded
            function(texture) {
                // do something with the texture
                AssetManager.AssetManager.assets.bkgLoading.material = texture;
                this.itemsLoaded++;
                this.checkIfFinished(this.callback);
                this.bg.geo = new THREE.PlaneGeometry(GameScreen.Screen.width, GameScreen.Screen.height);
                this.bg.mat = new THREE.MeshBasicMaterial({
                    map: texture
                });
                this.bg.mesh = new THREE.Mesh(this.bg.geo, this.bg.mat);
                this.bg.mesh.position.z = -5;
                this.scene.add(this.bg.mesh);
            }.bind(this));

        this.createLights();

        // center the camera
        this.positionCamera(0, 10, 18);
    }

    // check to see if we are done loading everything that needs to be loaded for this screen
    checkIfFinished(callback) {
        if (this.itemsLoaded === this.numThingsToLoad) {
            this.screenState = "loaded1";
            callback();
        }
    }
    // numberItems is the number of increments for this progress bar
    initProgressBar(numberItems: number) {
        this.numIncrements = numberItems;
        this.screenState = "loading2";
    }

    // just in case we need an update loop for this screen
    update(dt, elapsed) {
        switch (this.screenState) {
            case "loading2":
            // check to see if a progress update was received
            if (LoadingScreen.prevProgressCounter !== LoadingScreen.curProgressCounter) {
                LoadingScreen.prevProgressCounter = LoadingScreen.curProgressCounter;
                this.updateProgressBar();
            }
            break;
            case "loaded2":
                this.screenState = "loadingComplete";
                console.log("loading complete");
                AssetManager.AssetManager.allAssetsLoaded = true;
                this.showGameStart();
                break;
        }
        // need to use a this.TWEEN to point to the TWEEN object that is referenced in the superclass
        this.TWEEN.update();
    }


    // called in order to denote progress by the process that is being tracked
    updateProgress(increment?) {
        // LoadingScreen.prevLoadedCounter = LoadingScreen.loadedCounter;
        LoadingScreen.curProgressCounter += increment;
    }

    updateProgressBar() {
        // console.log("increment " + increment + ", total " + LoadingScreen.incrementCounter);

        let incrementWidth = Math.abs(this.minX * 2 / this.numIncrements);

        this.scene.remove(this.currentPgBar);
        let barWidth = incrementWidth * LoadingScreen.curProgressCounter;
        let pgBarGeometry = new THREE.PlaneGeometry(barWidth, this.pgBar.height, 48);
        let pgBarMaterial = new THREE.MeshBasicMaterial({
            map: this.pgTex,

            side: THREE.DoubleSide
        });
        let pgBarMesh = new THREE.Mesh(pgBarGeometry, pgBarMaterial);
        let xPos = this.minX + (LoadingScreen.curProgressCounter * incrementWidth / 2);
        pgBarMesh.position.x = xPos;
        pgBarMesh.position.y = -40;
        this.currentPgBar = pgBarMesh;
        this.scene.add(this.currentPgBar);
        // console.log(xPos + " : " + barWidth);
        if (LoadingScreen.curProgressCounter === this.numIncrements) {
            this.screenState = "loaded2";
        }
    }

    showGameStart() {
        this.scene.remove(this.currentPgBar);
        this.scene.remove(this.textMesh);

       this.startButton = Controls.Controls.createThreeButton(
            "Start",
            0x1111ff,
            AssetManager.AssetManager.assets.helvetiker_regular.font,
            "startButton"
        );
        this.touchableMeshes = this.touchableMeshes.concat(this.startButton.children);
        this.scene.add(this.startButton);

    }
    createLights() {
        let directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(0, 0, 20).normalize();
        this.scene.add(directionalLight);
    }

    hammerEventReceived(event) {
        // only acknowledge events if this screen is the current game screen
            let touched = Utils.Utils.hammerEventReceived(event, this.camera, this.touchableMeshes);

            if (touched.length > 0) {
                switch (touched[0].object.userData.id) {
                    case "startButton":
                        console.log("start");
                        Controls.Controls.pushButton(this.startButton, true);
                        GameScreen.Screen.setCurrentcreen(this.nextScreen);
                        return true;
                        break;
                }
            }

    }
}