/// <reference path="./defs/three/three.d.ts" />
/// <reference path="./defs/jquery/jquery.d.ts" />
/// <reference path="./defs/hammer/hammer.d.ts" />
/// <reference path="./defs/tween.js/tween.js.d.ts" />

import * as TWEEN from "tween.js";
import * as THREE from "three";
import * as $ from "jquery";
import * as Hammer from "hammerjs";

// a game scene.  It will have the camera, lights, and scene graph
export class Screen {
    static sceneID: number = 0;
    static screens = [];
    static currentScreen;   // the currently displayed screen
    static width: number;
    static height: number;
    static isEventsSetup = false;

    name: string;
    order: number;
    camera;
    lights = [];

    scene;
    overlay;
    displayStatus: string = "hidden";
    dirLight;
    ambLight;

    prevScreen;
    nextScreen;

    hammer; // hammer instance used to responsd to user inputs, shared amongst all screens
    TWEEN = TWEEN;

    constructor(options?) {
        if (options.name ) {
            this.name = options.name;
        }if (options.order ) {
            this.order = options.order;
        }
        if (options.overlay ) {
            this.overlay = options.overlay;
        }
        if (options.prevScreen ) {
            this.prevScreen = options.prevScreen;
        }
        if (options.nextScreen ) {
            this.nextScreen = options.nextScreen;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -Screen.width / 2,
            Screen.width / 2,
            Screen.height / 2,
            -Screen.height / 2, 0.01, 25 );
        // this.camera = new THREE.PerspectiveCamera(
        //     130,
        //     options.width / options.height,
        //     1, 50 );


        // ambient light common to all screens
        this.ambLight = new THREE.AmbientLight( 0x444444);
        this.ambLight.position.set( 0, 5, 5 );
        this.scene.add(this.ambLight );
        this.lights.push (this.ambLight);

        if (options.order) {
            Screen.screens[this.order] = this;
        }

        if (options.overlay) {
            // $("#" + [this.overlay]).hide();
        }
         Screen.sceneID++;

        // set up hammer events and only do it the first time this constructor is called
        if (!Screen.isEventsSetup) {
            this.setupEvents();
            Screen.isEventsSetup = true;
        }
    }

    public static init() {
        Screen.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        Screen.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        if (Screen.width > Screen.height) {
            Screen.width = 9 * Screen.height / 16;
        }
    }

    public static getWidth() {
        return Screen.width;
    }

    public static getHeight() {
        return Screen.height;
    }

    public static getCurrentScreen() {
            return Screen.currentScreen;
    }

    public static setCurrentcreen(screen) {
        // if there is a current screen then hide it
        if (Screen.currentScreen) {
            Screen.currentScreen.hide();
        }
        Screen.currentScreen = screen;
        Screen.currentScreen.show();
    }

    /**************************************
     * show this screen
     */
    show() {
        if (this.overlay) {
            document.getElementById(this.overlay).style.visibility = "visible";
        }
         // $("#" + [this.overlay]).show();
         this.displayStatus = "shown";
         Screen.currentScreen = this;
    }

    /*****************************************
     * hide this screen
     */
    hide() {
        if (this.overlay) {
            // $("#" + [this.overlay]).hide();
            document.getElementById(this.overlay).style.visibility = "hidden";
        }
        this.displayStatus = "hidden";
    }

    /********************************************
     * add an item to this screen's scene
     */
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

     setupEvents() {
        this.hammer = new Hammer(document.body);
        let that = this;
        this.hammer.on("tap", function(event) {
            that.hammerDispatch(event);
            console.log("tap");
        });
        this.hammer.on("press", function(event) {
            // console.log("press");
            that.hammerDispatch(event);
            console.log("down");
        });
        this.hammer.on("pressup", function(event) {
            // console.log("press up");
            that.hammerDispatch(event);
            console.log("up");
        });
    }

    // dispatch the hammer event to the current screen
    hammerDispatch(event) {
        // if ((!event.userData) || (!event.userData.handled)) {
        //     if (Screen.getCurrentScreen().hammerEventReceived(event)){
            Screen.getCurrentScreen().hammerEventReceived(event);
               // event.userData = {handled: true};
        //     }
        // }
    }
}

