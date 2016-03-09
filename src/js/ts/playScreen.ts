/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/hammer/hammer.d.ts" />

import * as THREE from "three";

import GameScreen = require("./gameScreen");
import FallingItem = require("./fallingItem");
import StaticItem = require("./staticItem");
import Controls = require("./controls");
import * as Hammer from "hammerjs";
import Utils = require("./utils");

export class PlayScreen extends GameScreen.Screen {
    controls = { leftButton: null, downButton: null, rightButton: null };
    blockWidth;
    bg = {geo: null, mat: null, mesh: null};


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

        this.bg.geo = new THREE.PlaneGeometry(GameScreen.Screen.width, GameScreen.Screen.height);
        this.bg.mat = new THREE.MeshBasicMaterial({

        });
        this.bg.mesh = new THREE.Mesh(this.bg.geo, this.bg.mat);
        this.bg.mesh.position.z = -5;
        this.scene.add(this.bg.mesh);

        this.createLights();

        // center the camera
        this.positionCamera(0, 10, 18);
    }

    createLights() {
        let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
        directionalLight.position.set( 0, 0, 20 ).normalize();
        this.scene.add( directionalLight );
    }

    hammerEventReceived(event) {
        // only acknowledge events if this screen is the current game screen

            let touched = Utils.Utils.hammerEventReceived(event, this.camera, this.scene.children);


            if ((touched) && (touched.length > 0)) {
                switch (touched[0].object.userData.id) {
                    case "leftButton":
                    // console.log("left");
                    FallingItem.FallingItem.addMove("left");
                    Controls.Controls.pushButton(this.controls.leftButton, false);
                    return true;
                    break;
                case "rightButton":
                    // console.log("right");
                    FallingItem.FallingItem.addMove("right");
                    Controls.Controls.pushButton(this.controls.rightButton, false);
                    return true;
                    break;
                case "downButton":
                    // console.log("down");
                    FallingItem.FallingItem.fallFaster = !FallingItem.FallingItem.fallFaster;
                    Controls.Controls.pushButton(this.controls.downButton, false);
                    return true;
                    break;
                }
            }

    }
}