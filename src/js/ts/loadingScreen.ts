import * as THREE from "three";

import GameScreen = require("./gameScreen");

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
     minX = -100;   // the width of the pogress bar will be twice the absolute value of this number
     numIncrements = 4;
     static incrementCounter = 0;

    constructor (options?) {
        super(options);
        this.screenWidth = options.screenDim.width;
        this.screenHeight = options.screenDim.height;

        this.textGeo = new THREE.TextGeometry( "Loading", {});
        // let pgBarGeometry = new THREE.PlaneGeometry(this.pgBar.width, this.pgBar.height, 32);
        // let pgBarMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        // let pgBarMesh = new THREE.Mesh( pgBarGeometry , pgBarMaterial );
        // pgBarMesh.position.x = this.minX;
        // this.currentPgBar = pgBarMesh;
        // this.scene.add( this.currentPgBar );

        this.createLights();

        // center the camera
        this.positionCamera(0, 10, 18);


        // this.testProgressBar();
    }

    // numberItems is the number of increments for this progress bar
     initProgressBar(numberItems: number) {
         this.numIncrements = numberItems;
    }

    update(dt) {
        debugger;
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