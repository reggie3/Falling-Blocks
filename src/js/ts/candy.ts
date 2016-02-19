/// <reference path="./defs/three/three.d.ts" />

import * as THREE from "three";
import ThreeItem = require ("./threeItem");

export class Candy extends ThreeItem.Box{

    static candyID: number = 0;
    static candies = {};
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
        Candy.candies[this.thisCandyID] = this;
        Candy.candyID ++;
     }

     update() {
         super.update();
         switch (this.movementStatus) {
            case "stopped":
                this.normalizePosition();   // round the positions to the nearest 5 tenths
                var collisionMeshArrays = this.getCollisionMeshArrays();
                var adjacentCandies = this.getAdjacentcandies(collisionMeshArrays);
                this.checkForMatchingCandies(adjacentCandies);
                this.movementStatus = "checked";
            break;

         }

     }
     
     static getCandyByID(id) {
         return Candy.candies[id];
     }
     /*********************************************************
      * check for matches around this blocks
      *  arrays is an object containing the intersected objects around this block
      */
      private checkForMatchingCandies(arrays) {
          
      }
     
     
     /********************************************
      * return arrays containing the meshes surrounding this block
      *  returns an object containing the meshes to the left, right, up, and down a distance of two objects away
      */
     private getCollisionMeshArrays() {
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
        this.removeNoncontiguousItems(collisionArrays);
        if (collisionArrays.down[0]) {
            this.bumpUpBottomDistance(collisionArrays.down);
        }
        return collisionArrays;
     }
     
     /*******************************************************
      * convert the adjacent meshes to candies to the left, right, up, down for two meshes away and 1 block surrounding this block (with this block in the middle)
      */
     private getAdjacentcandies(arrays) {
         var adjacentCandies = {
             left: [],
             right: [],
             up: [],
             down: [],
             midHorz: [],
             midVert: []
         };
         if (arrays.left.length === 2) {
             adjacentCandies.left.push(
                 Candy.getCandyByID(arrays.left[1].object.candyID),
                 Candy.getCandyByID(arrays.left[0].object.candyID),
                 this
             );
         }
          if (arrays.right.length === 2) {
             adjacentCandies.right.push(
                 this,
                 Candy.getCandyByID(arrays.right[0].object.candyID), Candy.getCandyByID(arrays.right[1].object.candyID)
             );
         }
         if (arrays.up.length === 2) {
             adjacentCandies.up.push(
                 Candy.getCandyByID(arrays.up[1].object.candyID), Candy.getCandyByID(arrays.up[0].object.candyID),
                 this
             );
         }
         if (arrays.down.length === 2) {
             adjacentCandies.down.push(
                 this,
                 Candy.getCandyByID(arrays.down[0].object.candyID), Candy.getCandyByID(arrays.down[1].object.candyID)
             );
         }
         if ((arrays.left.length >= 1) && (arrays.right.length >= 1)) {
             adjacentCandies.midHorz.push(
                 Candy.getCandyByID(arrays.left[0].object.candyID),
                 this,
                 Candy.getCandyByID(arrays.right[0].object.candyID)
             );
         }
         if ((arrays.up.length >= 1) && (arrays.down.length >= 1)) {
             adjacentCandies.midVert.push(
                 Candy.getCandyByID(arrays.up[0].object.candyID),
                 this,
                 Candy.getCandyByID(arrays.down[0].object.candyID)
             );
         }
         return adjacentCandies;
     }
     /*************************************
      * normalize the position so that blocks are centered on the nearest 5 tenths location
      */
      private normalizePosition() {
          this.mesh.position.x = Math.ceil(this.mesh.position.x * 50) / 50;
          this.mesh.position.y = Math.ceil(this.mesh.position.y * 50) / 50;
          this.mesh.position.z = Math.ceil(this.mesh.position.z * 50) / 50;
          
          console.log ("Normalized Pos = " + this.mesh.position.x + ", " + this.mesh.position.y + ", " + this.mesh.position.z);
      }
     
     /*********************************
      * Ensure the distance between the center of this block and the one below it is exactly equal to one block
      */
      private bumpUpBottomDistance(array) {
          if (array[0].distance < this.dim.height) {
              this.mesh.position.y = array[0].object.position.y + this.dim.height;
          }
      }
     /****************************************
      * Remove duplicate items from the detected items arrays
      */
     private removeDuplicates(collisionArrays) {
         for (var ray in collisionArrays) {
             if (collisionArrays.hasOwnProperty(ray)) {
                 for(var i = collisionArrays[ray].length - 1; i > 0; i--) {
                     if (collisionArrays[ray][i].object.candyID ===  collisionArrays[ray][i - 1].object.candyID) {
                         collisionArrays[ray].splice(i, 1);
                     }
                 }
             }
         }
     }
     
     /****************************************
      * empty out arrays that dont detect an item immediately next to this block
      */
     private removeNoncontiguousItems(collisionArrays) {
         for (var ray in collisionArrays) {
             if (collisionArrays.hasOwnProperty(ray)) {
                 if ((collisionArrays[ray][0]) && (collisionArrays[ray][0].distance > this.dim.width)) {
                     collisionArrays[ray] = [];
                 }
             }
         }
     }
}