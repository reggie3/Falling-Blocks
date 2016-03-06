/// <reference path="./defs/tween.js/tween.js.d.ts" />

import * as TWEEN from "tween.js";
import * as THREE from "three";
import AssetManager = require("./assetManager");


export class Utils {
    static hammerEventReceived(event, camera, intersectees) {
        // output the type of event it was
        // console.log(event.srcEvent + " received");
        let tapPoint = new THREE.Vector2();
        switch (event.pointerType) {
            case "touch":
            case "mouse":
                tapPoint.x = event.center.x;
                tapPoint.y = event.center.y;
                break;
        }
        // console.log("touchpoint " + tapPoint.x + ", " + tapPoint.y);
        let worldCoords = Utils.convertCoordsToThreescreen
            (new THREE.Vector2(tapPoint.x, tapPoint.y));
        // console.log("world Coords: " + worldCoords.x + ", " + worldCoords.y);

        let raycaster = new THREE.Raycaster(); // create once
        // raycasting code from each camera copied from here:
        // http://stackoverflow.com/questions/25024044/three-js-raycasting-with-camera-as-origin
        if (camera instanceof THREE.OrthographicCamera) {
            worldCoords.unproject(camera);
            let dir = new THREE.Vector3;
            dir.set(0, 0, - 1).transformDirection(camera.matrixWorld);
            raycaster.set(worldCoords, dir);
        }
        // TODO: raycaster does not work with perspective camera
        else if (camera instanceof THREE.PerspectiveCamera) {
            worldCoords.unproject(camera);
            raycaster.set(camera.position, worldCoords.sub(camera.position).normalize());
        }

        let intersectionArray = raycaster.intersectObjects(intersectees);
        if (intersectionArray.length > 0) {
            return intersectionArray;
        }

    }
    static convertCoordsToThreescreen
        (coords: THREE.Vector2) {
        let worldCoords = new THREE.Vector3(
            (coords.x / window.innerWidth) * 2 - 1,
            - (coords.y / window.innerHeight) * 2 + 1,
            -1);

        return worldCoords;
    }


}