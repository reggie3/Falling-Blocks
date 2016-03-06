/// <reference path="./defs/three/three.d.ts" />

import * as THREE from "three";

import GameScreen = require("./gameScreen");
import FallingItem = require("./fallingItem");
import StaticItem = require("./staticItem");
import Controls = require("./controls");

export class PlayScreen extends GameScreen.Screen {
    controls = { leftButton: null, downButton: null, rightButton: null };
    blockWidth;
    constructor (options?) {
        super(options);
        this.blockWidth = options.blockWidth;

        let groundY = - 10 * this.blockWidth;
        // create the ground
        let ground = new StaticItem.StaticItem({
            width: this.blockWidth * 11,
            height: this.blockWidth,
            depth: this.blockWidth,
            x: 0,
            y: groundY,
            z: 0,
            color: new THREE.Color("rgb(0,140,0)"),
            name: "ground",
            screen : this
        });
        this.add(ground);

        // create controls
        let buttonYDisplacement = 2.5 * this.blockWidth;
        this.controls.leftButton = new Controls.Controls("circle", "leftButton",
        new THREE.Vector3(-5 * this.blockWidth, groundY - buttonYDisplacement, 0), {
            size: this.blockWidth * 1.5,
            segments: 32,
            color: new THREE.Color("rgb(140,140,0)")
        });
        this.controls.downButton = new Controls.Controls("circle", "downButton",
        new THREE.Vector3(0,  groundY - buttonYDisplacement, 0), {
            size: this.blockWidth * 1.5,
            segments: 32,
            color: new THREE.Color("rgb(140,140,0)")
        });
        this.controls.rightButton = new Controls.Controls("circle", "rightButton",
        new THREE.Vector3(5 * this.blockWidth,  groundY - buttonYDisplacement, 0), {
            size: this.blockWidth * 1.5,
            segments: 32,
            color: new THREE.Color("rgb(140,140,0)")
        });

        for (let control in this.controls) {
            if (this.controls.hasOwnProperty(control)) {
                this.add(this.controls[control]);
            }
        }

        this.createLights();

        // center the camera
        this.positionCamera(0, 10, 18);
    }

    createLights() {
        let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
        directionalLight.position.set( 0, 0, 20 ).normalize();
        this.scene.add( directionalLight );
    }
}