/// <reference path="./defs/three/three.d.ts" />

import * as THREE from "three";

// a game scene.  It will have the camera, lights, and scene graph
export class Screen {
    name: string;
    sequence: string;
    camera;
    lights = [];
    static sceneID: number = 0;
    static scenes = [];
    scene;


    constructor(options?) {
        if (options.name ) {
            this.name = name;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -options.width / 2,
            options.width / 2,
            options.height / 2,
            -options.height / 2, 0.1, 25 );
        // this.camera = new THREE.PerspectiveCamera(
        //     130,
        //     options.width / options.height,
        //     1, 50 );



        // console.log("scene " + Scene.sceneID  + " created");
        Screen.scenes.push(this);
        Screen.sceneID++;
    }

    add(item) {
        this.scene.add(item.mesh);
    }

    positionCamera(x?: number, y?: number, z?: number) {
        if (x)
            this.camera.position.x = x;
        if (y)
            this.camera.position.y = y;
        if (z)
            this.camera.position.z = z;
    }
}

