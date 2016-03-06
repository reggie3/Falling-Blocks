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

    // create a button
    //  returns an object3D to be added to a scene
    static createThreeButton(label, color, font, id) {
        let btn = new THREE.Object3D();
        let textPadding = 1.50; // how much bigger the button is than the text
        let glowPadding = 20; // the multiplier size of the glow portion

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
            opacity: .6,
            transparent: true
        });

        let gloMesh = new THREE.Mesh(glowGeo, glowMat);
        foreMesh.position.z = -1;
        gloMesh.position.z = -2;

        // label the meshes as part of the button
        gloMesh.userData.id = id;
        textMesh.userData.id = id;
        foreMesh.userData.id = id;

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