/// <reference path="./defs/three/three.d.ts" />
import * as THREE from "three";

export class Game {
    name: string;
    state: string;
    renderer;
    now;    // now time
    then;   // previous time
    delta;  // time difference
    clock;

    constructor(width, height) {

        this.clock = new THREE.Clock(true);

        // init renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);


        // console.log("new world created.");
        // console.log("new Game created");
    }

    render(screen) {
        this.renderer.render(screen.scene, screen.camera);
    }

}

// an item in the game.  meant to be a superclass for actual game objects
export class GameItem {
    static gameItemID: number = 0;
    static gameItems = [];
    gameObjectID: number;

    constructor() {
        this.gameObjectID = GameItem.gameItemID;

        // store this gameObject in an array for later
        GameItem.gameItems[this.gameObjectID] = this;
        console.log("Object " + GameItem.gameItemID + " created.");
        GameItem.gameItemID++;
    }

    getItem(id: number) {
        return GameItem.gameItems[id];
    }
}

