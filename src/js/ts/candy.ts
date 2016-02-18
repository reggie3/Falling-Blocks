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

        var collisionArrays = {left: null, right: null, up: null, down: null};
        collisionArrays.left = myRays.left.intersectObjects( Candy.candyMeshes );
        collisionArrays.right = myRays.right.intersectObjects( Candy.candyMeshes );
        collisionArrays.up = myRays.up.intersectObjects( Candy.candyMeshes );
        collisionArrays.down = myRays.down.intersectObjects( Candy.candyMeshes );
        this.removeDuplicates(collisionArrays);
        
        debugger;
     }
     
     private removeDuplicates(collisionArrays) {
         for (var ray in collisionArrays) {
             if (collisionArrays.hasOwnProperty(ray)) {
                 for(var i = collisionArrays[ray].length - 1; i > collisionArrays[ray].length; i--) {
                     if (collisionArrays[ray][i].distance ===  collisionArrays[ray][i - 1].distance) {
                         collisionArrays[ray].splice(i, 1);
                     }
                 }
             }
         }
     }
}