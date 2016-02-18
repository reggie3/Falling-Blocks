/// <reference path="./defs/three/three.d.ts" />

import * as THREE from "three";
import ThreeItem = require ("./threeItem");

export class Candy extends ThreeItem.Box{

    static candyID: number = 0;
    static candie = {};
    static candyMeshes = [];
    thisCandyID: number;
    type: string;
    checkStatus: string;

    candyTypes = [
        {
            name: "red",
            color: 0xff0000,
        },
        {
            name: "green",
            color: 0x00ff00,
        },
        {
            name: "blue",
            color: 0x0000ff,
        },
        {
            name: "yellow",
            color: 0xffff00,
        },
        {
            name: "purple",
            color: 0xff00ff,
        },
    ];

     constructor(options?) {
        super(options);
        this.thisCandyID = Candy.candyID;
        

        // select a candy type
        var min = 0; // left bound
        var max = this.candyTypes.length;  // right bound
        var candy = this.candyTypes[Math.floor(Math.random() * (max - min) + min )];

        this.mesh.material.color.setHex(candy.color);
        this.mesh.candyID = this.thisCandyID;
        Candy.candyMeshes.push(this.mesh);  // we'll need to shot rays against these later
        this.type = candy.name;
        Candy.candyID ++;
     }

     update() {
         super.update();
         switch (this.movementStatus) {
            case "stopped":
              if (this.checkStatus !== "checked") {
                this.checkForMatches();
                this.checkStatus = "checked";
              }
            break;
            case "moving":
                this.checkStatus = "unchecked";
            break;
         }

     }
     private checkForMatches() {
        var originPoint = this.mesh.position.clone();
        var myRays = {left: null, right: null, up: null, down: null};

        myRays.left = new THREE.Raycaster(originPoint,
            new THREE.Vector3(-1, 0, 0),
            0,
            this.dim.width * 2);
        myRays.right = new THREE.Raycaster(originPoint,
            new THREE.Vector3(1, 0, 0),
            0,
            this.dim.width * 2);
        myRays.up = new THREE.Raycaster(originPoint,
            new THREE.Vector3(0, 1, 0),
            0,
            this.dim.height * 2);
        myRays.down = new THREE.Raycaster(originPoint,
            new THREE.Vector3(0, -1, 0),
            0,
            this.dim.height * 2);

        var leftCol = myRays.left.intersectObjects( Candy.candyMeshes );
        var rightCol = myRays.right.intersectObjects( Candy.candyMeshes );
        var upCol = myRays.up.intersectObjects( Candy.candyMeshes );
        var downCol = myRays.down.intersectObjects( Candy.candyMeshes );
        
        debugger;
     }
}