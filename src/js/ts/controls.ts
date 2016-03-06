/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/tween.js/tween.js.d.ts" />

import * as TWEEN from "tween.js";
import * as THREE from "three";
import ThreeItem = require("./threeItem");

import AssetManager = require("./assetManager");

export class Controls extends ThreeItem.ThreeItem {
    static controlID: number = 0;
    static controls = {};
    static meshes = []; // an array of meshes to use in touch events
    thisControlID: number;
    controlName: string;

    constructor (shape: string, name: string, pos: THREE.Vector3, options?) {
        super();
        this.thisControlID = Controls.controlID;
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

        Controls.controls[this.thisControlID] = this;

        Controls.meshes.push(this.mesh);
        Controls.controlID ++;
    }

    static getControlByID(id: number) {
        return Controls.controls[id];
    }

    getControlByName(name: string) {
        for (let control in Controls.controls) {
            if (Controls.controls.hasOwnProperty(control)) {
                if (Controls.controls[control].name === name) {
                    return Controls.controls[control];
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
            // color: options && options.color || null,
            map: AssetManager.AssetManager.getAssetByTag(this.name).texture
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    update() {

    }

    // create a button
    //  returns an object3D to be added to a scene
    static createThreeButton(label, color, font, id) {
        let btn = new THREE.Object3D();
        let textPadding = 1.50; // how much bigger the button is than the text
        let glowPadding = 12; // the multiplier size of the glow portion

        let startTextGeo = new THREE.TextGeometry(label, {
            font: font,
            size: 25,
            height: 0,
            curveSegments: 48,
            bevelEnabled: false
        });
        THREE.GeometryUtils.center(startTextGeo);
        let textMat = new THREE.MeshBasicMaterial({});
        let textMesh = new THREE.Mesh(startTextGeo, textMat);

        let textSize = textMesh.geometry.boundingBox.max.sub(textMesh.geometry.boundingBox.min);
        let butWidth = textSize.x * textPadding;
        let butHeight = textSize.y * textPadding;
        let foreGeo = new THREE.PlaneGeometry(butWidth, butHeight);
        let foreMat  = new THREE.MeshBasicMaterial({
            color: color
        });
        let foreMesh = new THREE.Mesh(foreGeo, foreMat);

        let glowGeo = new THREE.PlaneGeometry(butWidth + glowPadding, butHeight + glowPadding);
        let glowMat  = new THREE.MeshBasicMaterial({
            color: color,
            opacity: .4,
            transparent: true
        });
        let gloMesh = new THREE.Mesh(glowGeo, glowMat);

        let hlGeo = new THREE.PlaneGeometry(butWidth + glowPadding, butHeight + glowPadding);
        let hlMat  = new THREE.MeshBasicMaterial({
            opacity: .75,
            transparent: true
        });
        let hlMesh = new THREE.Mesh(glowGeo, glowMat);



        foreMesh.position.z = -1;
        gloMesh.position.z = -2;
        hlMesh.position.z = -3

        // label the meshes as part of the button
        gloMesh.userData.id = id;
        textMesh.userData.id = id;
        foreMesh.userData.id = id;
        hlMesh.userData.id = id;

        btn.add(hlMesh);
        btn.add(gloMesh);
        btn.add(foreMesh);
        btn.add(textMesh);

        return btn;

    }

    // start the tweens associcated with pushing a button that is a THREE.Object3D
    static pushButton(btn) {
        let tween = new TWEEN.Tween(btn.scale)
            .to({x: .9, y: .9}, 50)
            .repeat(1)
            .yoyo(true)
            .start();
        AssetManager.AssetManager.assets.click.soundSprite.play();
    }

}