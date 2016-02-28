/// <reference path="./defs/three/three.d.ts" />

import * as THREE from "three";
import ThreeItem = require("./threeItem");

import AssetManager = require("./assetManager");

export class Control extends ThreeItem.ThreeItem{
    static controlID: number = 0;
    static controls = {};
    static meshes = []; // an array of meshes to use in touch events
    thisControlID: number;
    controlName: string;

    constructor (shape: string, name: string, pos: THREE.Vector3, options?) {
        super();
        this.thisControlID = Control.controlID;
        this.name = name;

        switch (shape) {
            case "sphere":
                this.createSphereMesh(options);
            break;
            case "circle":
                this.createCircleMesh(options);
            break;
            case "square":
            case "box":
                this.createBoxMesh(options);
            break;
        }

        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.userData.controlID = this.thisControlID;

        Control.controls[this.thisControlID] = this;

        Control.meshes.push(this.mesh);
        Control.controlID ++;
    }

    static getControlByID(id: number) {
        return Control.controls[id];
    }

    getControlByName(name: string) {
        for (let control in Control.controls) {
            if (Control.controls.hasOwnProperty(control)) {
                if (Control.controls[control].name === name) {
                    return Control.controls[control];
                }
            }
        }
    }

    private createSphereMesh(options?) {
        this.geometry = new THREE.SphereGeometry(options && options.size || null);
        this.material = new THREE.MeshBasicMaterial({
            color: options && options.color || null
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    private createBoxMesh(options?) {
        this.geometry = new THREE.BoxGeometry(
            options && options.size || null,
            options && options.size || null,
            options && options.size || null
        );
        this.material = new THREE.MeshBasicMaterial({
            color: options && options.color || null
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
    private createCircleMesh(options?) {
        this.geometry = new THREE.CircleGeometry(options && options.size || null, options && options.segments || null);
        this.material = new THREE.MeshBasicMaterial({
            color: options && options.color || null
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    update() {

    }

}