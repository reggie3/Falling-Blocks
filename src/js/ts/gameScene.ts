/// <reference path="./defs/three/three.d.ts" />

import * as THREE from "three";

// a game scene.  It will have the camera, lights, and scene graph
export class Scene {
    name: string;
    sequence: string;
    camera;
    lights = [];
    static sceneID: number = 0;
    static scenes = [];
    threeScene;


    constructor(options?) {
        ;
        if (options.name ) {
            this.name = name;
        }

        this.threeScene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -options.width / 2,
            options.width / 2,
            options.height / 2,
            -options.height / 2, 0.1, 25 );

        console.log("scene " + Scene.sceneID  + " created");
        Scene.scenes.push(this);
        Scene.sceneID++;
    }

    add(item) {
        this.threeScene.add(item.mesh);
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

