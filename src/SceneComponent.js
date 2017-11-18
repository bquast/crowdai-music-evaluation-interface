import React from 'react';
import * as THREE from 'three';
import ReactDOM from 'react-dom';
import OrbitAndPanControls from './OrbitAndPanControls.js';
var ColladaLoader = require('three-collada-loader');

class SceneComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      cubeRotation: new THREE.Euler(),
    };

    this.init_lights = this.init_lights.bind(this);
    this.prepare_scene = this.prepare_scene.bind(this);
    this.initialize_keys = this.initialize_keys.bind(this);
    this.frame = this.frame.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.update_key = this.update_key.bind(this);
    this.on_window_resize = this.on_window_resize.bind(this);
    this.smoothstep = this.smoothstep.bind(this);
    this.mix = this.mix.bind(this);

    this.key_attack_time = 9.0;
    this.key_max_rotation = 0.72;
    this.octave = 2;
    this.song = "game_of_thrones.mid";
    this._noteOnColor = [ 255, 0, 0, 1.0 ];

  }
  frame(delta){
    // this.cube.rotation.x += 1;
    requestAnimationFrame(this.frame);
    var delta = this.clock.getDelta();
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    // this.render(delta);
    // console.log(this.camera);

  }

  componentDidMount(){
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 2.0, 5000 );
    this.keys_down = [];
    this.keys_obj = [];
    window.keys_obj = this.keys_obj;
    this.keyState = Object.freeze ({unpressed: {}, note_on: {}, pressed:{}, note_off:{} });

    this.renderer = new THREE.WebGLRenderer({antialias:true});
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.physicallyBasedShading = true;

    //document.body.appendChild( this.renderer.domElement );
    document.getElementsByClassName("piano_renderer")[0].appendChild(this.renderer.domElement);

    this.material = new THREE.MeshLambertMaterial( { color: 0x606060} )

    this.floor = new THREE.Mesh( new THREE.PlaneGeometry( 8000, 8000 ), new THREE.MeshBasicMaterial( { color: 0xf0f0f0 } ) );
    this.floor.rotation.x = - 90 * ( Math.PI / 180 );
    this.floor.position.y = -0.7;
    this.floor.receiveShadow = true;
    this.floor.castShadow = true;
    this.scene.add(this.floor);
    this.scene.fog = new THREE.Fog( 0xffffff, 40, 50 );

    this.noteOnColor = new THREE.Color(0xff0000);

    this.init_lights();

    var loader = new ColladaLoader();
    loader.load( 'https://raw.githubusercontent.com/spMohanty/3d-piano-player/master/obj/piano.dae', this.prepare_scene );

    this.camera.position.x = 3.71556267640217;
    this.camera.position.y = 5.01582526656281;
    this.camera.position.z = 14;
    this.camera.rotation.x = -0.4120525759793163;
    this.camera.rotation.y = -0.08530122399018532;
    this.camera.rotation.z = -0.03722052713838271;

    this.cameraControls = new OrbitAndPanControls(this.camera, this.renderer.domElement);
    this.cameraControls.target.set(5.5,-0.8,0);

    this.clock = new THREE.Clock();

    this.frame();
    window.addEventListener( 'resize', this.on_window_resize, false );
  }
  on_window_resize(){
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  // frame(){
  //     requestAnimationFrame(this.frame);
  //     var delta = this.clock.getDelta();
  //     this.update(delta);
  //     this.render(delta);
  // }
  update(delta){
      this.cameraControls.update(delta);
      // for(var i in this.keys_obj)
      // {
      //     this.update_key(this.keys_obj[i], delta);
      // }
  }

  update_key( obj, delta )
  {
    //
    // if(Math.random() < 0.0005){
    //   obj.rotation.x *= -1;
    // }
    if (obj.keyState == this.keyState.note_on)
    {

        obj.rotation.x = this.mix(-Math.PI/6.0, -this.key_max_rotation, this.smoothstep(0.0, 1.0, this.key_attack_time*obj.clock.getElapsedTime()));
        if (obj.rotation.x >= -Math.PI/6.0)
        {
            obj.keyState = this.keyState.pressed;
            obj.clock.elapsedTime = 0;
        }
        obj.material.color = this.noteOnColor;
    }
    else if (obj.keyState == this.keyState.note_off)
    {
        obj.rotation.x = this.mix(-Math.PI/6.0, -this.key_max_rotation, this.smoothstep(0.0, 1.0, this.key_attack_time*obj.clock.getElapsedTime()));
        obj.rotation.x = Math.random();
        if (obj.rotation.x <= -Math.PI/6.0)
        {
            obj.keyState = this.keyState.unpressed;
            obj.clock.elapsedTime = 0;
        }
        obj.material.color = obj.material.note_off;
    }

  }
  smoothstep(a,b,x){
      if( x<a ) return 0.0;
      if( x>b ) return 1.0;
      var y = (x-a)/(b-a);
      return y*y*(3.0-2.0*y);
  }
  mix(a,b,x)
  {
      return a + (b - a)*Math.min(Math.max(x,0.0),1.0);
  }

  initialize_keys(obj){
    this.keys_obj.push(obj);
    // obj.rotation.x = -Math.PI/6.0;
    obj.rotation.x = -Math.PI/6.0;
    obj.rotation.y = 0;
    obj.rotation.z = 0;
    obj.keyState = this.keyState.unpressed;
    obj.clock = new THREE.Clock(false);
    obj.castShadow = true;
    obj.receiveShadow = true;
    // only add meshes in the material redefinition (to make keys change their color when pressed)
    if (obj instanceof THREE.Mesh)
    {
        var old_material = obj.material;
        obj.material = new THREE.MeshPhongMaterial( { color:old_material.color} );
        obj.material.shininess = 35.0;
        obj.material.specular = new THREE.Color().setRGB(0.25, 0.25, 0.25);;
        obj.material.note_off = obj.material.color.clone();

        if(Math.random() < 0.1){
          //Key Press state
          obj.rotation.x = -Math.PI/6.0 + Math.PI/70;
              obj.material.color = this.noteOnColor;
        }

    }


  }

  prepare_scene(collada){
    collada.scene.traverse(this.initialize_keys);
    this.scene.add(collada.scene);
  }
  init_lights(){
    //var spotlight = new THREE.SpotLight(0xffffff);
    var spotlight = new THREE.DirectionalLight(0xffffff);

    spotlight.position.set(1.0,2.4,-7.5);
    spotlight.target.position.set(6.0,-6,8);
    spotlight.shadowCameraVisible = false;
    spotlight.shadowDarkness = 0.75;
    spotlight.intensity = 1;
    spotlight.castShadow = true;
    spotlight.shadowMapWidth = 2048;
    spotlight.shadowMapHeight = 2048;

    spotlight.shadowCameraNear = 5.0;
    spotlight.shadowCameraFar = 20.0;
    spotlight.shadowBias = 0.0025;

    spotlight.shadowCameraLeft = -8.85;
    spotlight.shadowCameraRight = 5.5;
    spotlight.shadowCameraTop = 4;
    spotlight.shadowCameraBottom = 0;
    this.scene.add(spotlight);

    var light1 = new THREE.DirectionalLight( 0xddffff, 1 );
    light1.position.set( 1, 1, -1 ).normalize();
    this.scene.add( light1 );

    var light2 = new THREE.DirectionalLight( 0xff5555, 0.5 );
    light2.position.set( -1, -1, -1 ).normalize();
    this.scene.add( light2 );
  }

  render() {
    return (
      <div className="piano_renderer">
      </div>
    );
  }
}

export default SceneComponent;
