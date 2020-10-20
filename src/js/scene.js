/* author: Andrew Burks */
"use strict";
/* Create a Threejs scene for the application */

/* Get or create the application global variable */
var App = App || {};

const Scene = function(options) {

    // setup the pointer to the scope 'this' variable
    const self = this;

    // scale the width and height to the screen size
    const width = d3.select('.particleDiv').node().clientWidth ;
    const height = width;

    // create the scene
    self.scene = new THREE.Scene();
    self.scene.background = new THREE.Color(0xFFFFFF);


    // setup the camera fov, aspect, near, far 
    self.camera = new THREE.PerspectiveCamera( 50, width / height, 0.4, 1000 );
    self.camera.position.set(0,2,25);
    self.camera.lookAt(0,0,0);

    // Add a directional light to show off the objects
    const light = new THREE.DirectionalLight( 0xffffff, 1.5);
    // Position the light out from the scene, pointing at the origin
    light.position.set(0,2,20);
    light.lookAt(0,0,0);

    self.camera.add(light);
    self.scene.add(self.camera);

    self.renderer = new THREE.WebGLRenderer();

    // use this for arrow key controls and camera panning
    var controls = new THREE.OrbitControls( self.camera, self.renderer.domElement );
    controls.update();

    // set the size and append it to the document
    self.renderer.setSize( width, height );
    document.getElementById(options.container).appendChild( self.renderer.domElement );


    // expose the public functions
    self.public = {

        resize: function() {

        },

        addObject: function(obj) {
            self.scene.add( obj );
        },

        render: function() {
            requestAnimationFrame( self.public.render );
            controls.update();
            self.renderer.render( self.scene, self.camera );
        }

    };

    return self.public;
};