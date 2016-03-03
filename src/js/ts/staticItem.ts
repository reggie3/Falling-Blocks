/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/tween.js/tween.js.d.ts" />

import * as TWEEN from "tween.js";
import * as THREE from "three";
import ThreeItem = require("./threeItem");

export class StaticItem extends ThreeItem.ThreeItem {
    static StaticItemID: number = 0;
    static StaticItems = {};

    thisStaticItemID: number;

    screen; // the game screen this object is in
    dim = { width: null, height: null, depth: null };


    constructor(options?) {
        super();
        this.thisStaticItemID = StaticItem.StaticItemID;
        StaticItem.StaticItemID++;

        this.name = options && options.name;
        this.screen = options && options.screen;


        // create the mesh
        this.dim.width = options && options.width || 1;
        this.dim.height = options && options.height || 1;
        this.dim.depth = options && options.depth || 1;

        this.geometry = new THREE.BoxGeometry(this.dim.width, this.dim.height, this.dim.depth);


        this.material = new THREE.MeshBasicMaterial({
             color: (options && options.color) ? options.color : new THREE.Color("rgb(255, 0, 0)")
            //  specular: 0x009900, shininess: 30, shading: THREE.FlatShading
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(
            options && options.x || 0,
            options && options.y || 0,
            options && options.z || 0
        );
        // console.log("StaticItem " + this.thisThreeItemID + " created");

        // add this item to the array of physics items
        StaticItem.StaticItems[this.thisStaticItemID] = this;

        this.mesh.userData.StaticItemID = this.thisStaticItemID;   // need to attach an ID to the THREE.js mesh so that we can call back to this class when dealing with the mesh. For example, raycaster returns the mesh, but we need to get back to the StaticItem
        // console.log ("StaticItem " + this.thisStaticItemID + " created");
    }

    update(dt, time) {


        }



    public static getStaticItemByID(id: number) {
        return StaticItem.StaticItems[id];
    }

    public static getStaticItemByName(name: string) {
        for (let item in StaticItem.StaticItems) {
            if (StaticItem.StaticItems.hasOwnProperty(item)) {
                if (StaticItem.StaticItems[item].name === name) {
                    return StaticItem.StaticItems[item];
                }
            }
        }
        return null;
    }




}

