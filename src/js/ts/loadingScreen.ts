import * as THREE from "three";

import GameScreen = require("./gameScreen");
import AssetManager = require("./assetManager");

export class LoadingScreen extends GameScreen.Screen {
     currentPgBar;
     screenWidth;
     screenHeight;
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

     minX = -100;   // the width of the pogress bar will be twice the absolute value of this number
     numIncrements = 4;
     static incrementCounter = 0;

    constructor (options, callback) {
        super(options);
        this.screenWidth = options.screenDim.width;
        this.screenHeight = options.screenDim.height;
        this.callback = callback;

        // load a font for use on this screen
        let loader = new THREE.FontLoader();
        let that = this;
        loader.load( AssetManager.AssetManager.assets.gentilis_regular.source,
            function ( response ) {
                AssetManager.AssetManager.assets.gentilis_regular.font = response;
                that.textGeo = new THREE.TextGeometry( "Please Wait", {
                    font: AssetManager.AssetManager.assets.gentilis_regular.font,
                    size: 25,
                    height: 0,
                    curveSegments: 48,
                    bevelEnabled: false
                });
                THREE.GeometryUtils.center( that.textGeo );
                that.textMat = new THREE.MeshBasicMaterial({});
                that.textMesh = new THREE.Mesh(that.textGeo, that.textMat);
                that.textMesh.position.y = 20;
                that.scene.add(that.textMesh);
            }, that);



        this.createLights();

        // center the camera
        this.positionCamera(0, 10, 18);

        // this.testProgressBar();
    }

    // numberItems is the number of increments for this progress bar
     initProgressBar(numberItems: number) {
         this.numIncrements = numberItems;
    }

    // just in case we need an update loop for this screen
    update(dt) {

    }

     testProgressBar() {
        let increment = 0;
        for (let i = 0; i < this.numIncrements; i++) {
            setTimeout(this.updateProgressBar(i + 1), 2000);
        }

    }

     updateProgressBar(increment?) {

         LoadingScreen.incrementCounter += increment;
         console.log("increment " + increment + ", total " + LoadingScreen.incrementCounter);

         let incrementWidth = Math.abs(this.minX * 2 / this.numIncrements);

        this.scene.remove(this.currentPgBar);
        let barWidth = incrementWidth * LoadingScreen.incrementCounter;
        let pgBarGeometry = new THREE.PlaneGeometry(barWidth, this.pgBar.height, 32);
        let pgBarMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        let pgBarMesh = new THREE.Mesh( pgBarGeometry , pgBarMaterial );
        let xPos = this.minX + (LoadingScreen.incrementCounter * incrementWidth / 2);
        pgBarMesh.position.x = xPos;
        pgBarMesh.position.y = -40;
        this.currentPgBar = pgBarMesh;
        this.scene.add( this.currentPgBar );
        console.log(xPos + " : " + barWidth);

    }

        createLights() {
        let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
        directionalLight.position.set( 0, 0, 20 ).normalize();
        this.scene.add( directionalLight );
    }
}