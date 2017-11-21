'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _OrbitAndPanControls = require('./OrbitAndPanControls.js');

var _OrbitAndPanControls2 = _interopRequireDefault(_OrbitAndPanControls);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ColladaLoader = require('three-collada-loader');
var getCompoundBoundingBox = function getCompoundBoundingBox(object3D) {
  var box = null;
  object3D.traverse(function (obj3D) {
    var geometry = obj3D.geometry;
    if (geometry === undefined) return;
    geometry.computeBoundingBox();
    if (box === null) {
      box = geometry.boundingBox;
    } else {
      box.union(geometry.boundingBox);
    }
  });
  return box;
};

var PianoComponent = function (_React$Component) {
  _inherits(PianoComponent, _React$Component);

  function PianoComponent(props) {
    _classCallCheck(this, PianoComponent);

    var _this = _possibleConstructorReturn(this, (PianoComponent.__proto__ || Object.getPrototypeOf(PianoComponent)).call(this, props));

    _this.props = props;
    _this.state = {
      key_states: _this.props.key_states,
      key_attack_time: _this.props.key_attack_time,
      key_max_rotation: _this.props.key_max_rotation,
      octave: _this.props.octave,
      canvas_id: "canvas_" + parseInt(Math.random() * 10000000)
    };

    console.log(_this.state);

    _this.init_lights = _this.init_lights.bind(_this);
    _this.prepare_scene = _this.prepare_scene.bind(_this);
    _this.initialize_keys = _this.initialize_keys.bind(_this);
    _this.frame = _this.frame.bind(_this);
    _this.update = _this.update.bind(_this);
    _this.render = _this.render.bind(_this);
    _this.update_key = _this.update_key.bind(_this);
    _this.on_window_resize = _this.on_window_resize.bind(_this);
    _this.smoothstep = _this.smoothstep.bind(_this);
    _this.mix = _this.mix.bind(_this);
    _this.key_status = _this.key_status.bind(_this);

    // this.song = "game_of_thrones.mid";
    _this._noteOnColor = [255, 0, 0, 1.0];
    _this.noteOnColor = new THREE.Color().setRGB(_this._noteOnColor[0] / 256.0, _this._noteOnColor[1] / 256.0, _this._noteOnColor[2] / 256.0);
    _this.keyState = Object.freeze({ unpressed: {}, note_on: {}, pressed: {}, note_off: {} });
    return _this;
  }

  _createClass(PianoComponent, [{
    key: 'frame',
    value: function frame(delta) {
      var delta = this.clock.getDelta();
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.frame);
      // console.log(this.camera);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 2.0, 5000);
      window.camera = this.camera;
      this.keys_down = [];
      this.keys_obj = [];
      window.keys_obj = this.keys_obj;

      // window.keyState = this.keyState;
      var canvas = document.getElementById(this.state.canvas_id);
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas
      });
      // this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.setSize(document.getElementsByClassName("piano_renderer")[0].clientWidth, document.getElementsByClassName("piano_renderer")[0].clientHeight);
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapSoft = true;
      this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
      this.renderer.gammaInput = true;
      this.renderer.gammaOutput = true;
      this.renderer.physicallyBasedShading = true;
      this.renderer.setClearColor(this.props.backgroundColor, 1);

      // window.THREE = THREE;
      // var axisHelper = new THREE.AxisHelper( 100 );
      // this.scene.add( axisHelper );

      //document.body.appendChild( this.renderer.domElement );
      document.getElementsByClassName("piano_renderer")[0].appendChild(this.renderer.domElement);

      this.material = new THREE.MeshLambertMaterial({ color: 0x606060 });

      if (!this.props.noFloor) {
        this.floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(8000, 8000), new THREE.MeshStandardMaterial({ color: 0xf0f0f0 }));
        // this.floor = new THREE.Mesh( new THREE.PlaneGeometry( 8000, 8000 ), new THREE.MeshBasicMaterial( { color: 0xff00 } ) );
        // this.floor.rotation.x = -90 * ( Math.PI /  180 );
        this.floor.rotation.x = -1 * (Math.PI / 4) - Math.PI / 2;
        this.floor.rotation.y = 0;
        this.floor.rotation.z = 0;
        this.floor.position.y = -0.25;
        this.floor.receiveShadow = true;
        this.floor.castShadow = true;
        this.scene.add(this.floor);
      }
      // this.scene.fog = new THREE.Fog( 0xffffff, 40, 50 );


      var loader = new ColladaLoader();
      loader.load('https://raw.githubusercontent.com/spMohanty/3d-piano-player/master/obj/piano.dae', this.prepare_scene);

      this.camera.position.x = 5.545733663570945;
      this.camera.position.y = 17.43496880968363;
      this.camera.position.z = 3.947804382819341;
      this.camera.rotation._x = -1.5247920075821781;
      this.camera.rotation._y = -0.0005485303441902907;
      this.camera.rotation._z = -0.011914475959049894;
      this.camera.quaternion._x = -0.6906427130333965;
      this.camera.quaternion._y = -0.0043127191736616706;
      this.camera.quaternion._z = -0.004118729646872374;
      this.camera.quaternion._w = 0.7231715422037117;
      this.camera.updateProjectionMatrix();

      // this.cameraControls = new OrbitAndPanControls(this.camera, this.renderer.domElement);
      // this.camera.zoom = 1.6;
      this.camera.updateProjectionMatrix();

      this.clock = new THREE.Clock();

      this.init_lights();

      this.frame();
      window.addEventListener('resize', this.on_window_resize, false);
      this.on_window_resize();
    }
  }, {
    key: 'on_window_resize',
    value: function on_window_resize() {
      this.camera.aspect = document.getElementsByClassName("piano_renderer")[0].clientWidth / document.getElementsByClassName("piano_renderer")[0].clientHeight;
      this.renderer.setSize(document.getElementsByClassName("piano_renderer")[0].clientWidth, document.getElementsByClassName("piano_renderer")[0].clientHeight);
      this.camera.updateProjectionMatrix();
    }
    // frame(){
    //     requestAnimationFrame(this.frame);
    //     var delta = this.clock.getDelta();
    //     this.update(delta);
    //     this.render(delta);
    // }

  }, {
    key: 'update',
    value: function update(delta) {
      // this.cameraControls.update(delta);
      window.camera = this.camera;
      for (var i in this.keys_obj) {
        this.update_key(this.keys_obj[i], delta);
      }
    }
  }, {
    key: 'smoothstep',
    value: function smoothstep(a, b, x) {
      if (x < a) return 0.0;
      if (x > b) return 1.0;
      var y = (x - a) / (b - a);
      return y * y * (3.0 - 2.0 * y);
    }
  }, {
    key: 'mix',
    value: function mix(a, b, x) {
      return a + (b - a) * Math.min(Math.max(x, 0.0), 1.0);
    }
  }, {
    key: 'update_key',
    value: function update_key(obj, delta) {
      if (obj.keyState == this.keyState.note_on) {

        obj.rotation.x = this.mix(-Math.PI / 4.0, -this.state.key_max_rotation, this.smoothstep(0.0, 1.0, this.state.key_attack_time * obj.clock.getElapsedTime()));
        if (obj.rotation.x >= -this.state.key_max_rotation) {
          obj.keyState = this.keyState.pressed;
          obj.clock.elapsedTime = 0;
        }

        if (obj.children.length > 0) {
          obj.children[0].material.color = this.noteOnColor;
        }
      } else if (obj.keyState == this.keyState.note_off) {
        obj.rotation.x = this.mix(-this.state.key_max_rotation, -Math.PI / 4.0, this.smoothstep(0.0, 1.0, this.state.key_attack_time * obj.clock.getElapsedTime()));
        if (obj.rotation.x <= -Math.PI / 4.0) {
          obj.keyState = this.keyState.unpressed;
          obj.clock.elapsedTime = 0;
        }

        if (obj.children.length > 0) {
          obj.children[0].material.color = obj.children[0].material.note_off;
        }
      }
    }
  }, {
    key: 'key_status',
    value: function key_status(keyName, status) {
      if (this.scene) {
        var obj = this.scene.getObjectByName(keyName, true);
        if (obj != undefined) {
          obj.clock.start();
          obj.clock.elapsedTime = 0;
          obj.keyState = status;
        }
      }
    }
  }, {
    key: 'initialize_keys',
    value: function initialize_keys(obj) {
      this.keys_obj.push(obj);
      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.rotation.x = -Math.PI / 4.0;
      // obj.rotation.x = 0;
      obj.rotation.y = 0;
      obj.rotation.z = 0;
      obj.keyState = this.keyState.unpressed;
      obj.clock = new THREE.Clock(false);
      obj.castShadow = true;
      obj.receiveShadow = true;
      // only add meshes in the material redefinition (to make keys change their color when pressed)
      if (obj instanceof THREE.Mesh) {
        var old_material = obj.material;
        obj.material = new THREE.MeshPhongMaterial({ color: old_material.color });
        obj.material.shininess = 100.0;
        obj.material.specular = new THREE.Color().setRGB(0.25, 0.25, 0.25);;

        obj.material.note_off = obj.material.color.clone();
      }
    }
  }, {
    key: 'fix_zoom',
    value: function fix_zoom() {
      var boundingBox = getCompoundBoundingBox(this.collada_scene);
      this.camera.zoom = 10;
      this.camera.updateMatrix();
      for (var i = 0; i < 1000; i += 1) {
        if (this.camera.zoom <= 0.5) {
          break;
        }
        this.camera.zoom -= 0.1;
        this.camera.updateProjectionMatrix();
        console.log("Zoom : ", this.camera.zoom);
        var frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));

        var pos_min = new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
        var pos_max = new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);

        if (frustum.containsPoint(pos_min) && frustum.containsPoint(pos_max)) {
          break;
        }
      }
    }
  }, {
    key: 'prepare_scene',
    value: function prepare_scene(collada) {
      collada.scene.traverse(this.initialize_keys);
      this.collada_scene = collada.scene;
      this.scene.add(collada.scene);
      // this.fix_zoom();
    }
  }, {
    key: 'init_lights',
    value: function init_lights() {
      //var spotlight = new THREE.SpotLight(0xffffff);
      var spotlight = new THREE.DirectionalLight(0xffffff);

      // spotlight.position.set(-10,10,-20);
      spotlight.position.set(-1, 1, -2);

      var targetObject = new THREE.Object3D();
      targetObject.position.x = 10;
      targetObject.position.y = 0;
      targetObject.position.z = 4;
      spotlight.target = targetObject;
      this.scene.add(targetObject);
      // window.keys_obj = this.keys_obj
      // spotlight.target.position.set(10, 10, -10);
      spotlight.shadowCameraVisible = true;
      spotlight.shadowDarkness = 0.75;
      spotlight.intensity = 1;
      spotlight.castShadow = true;
      spotlight.shadowMapWidth = 2048;
      spotlight.shadowMapHeight = 2048;

      // spotlight.shadowCameraNear = 5.0;
      // spotlight.shadowCameraFar = 20.0;
      spotlight.shadowBias = 0.0025;
      window.scene = this.scene;

      // spotlight.shadowCameraLeft = -8.85;
      // spotlight.shadowCameraRight = 5.5;
      // spotlight.shadowCameraTop = 4;
      // spotlight.shadowCameraBottom = 0;
      this.scene.add(spotlight);

      // var helper = new THREE.CameraHelper( spotlight.shadow.camera );
      // this.scene.add( helper );

      var light1 = new THREE.DirectionalLight(0xddffff, 1);
      light1.position.set(1, 1, -1).normalize();
      this.scene.add(light1);

      var light3 = new THREE.AmbientLight(0xffffff, 0.1);
      light3.position.set(0, 0, 10).normalize();
      this.scene.add(light3);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _temp = {};
      Object.keys(this.props.key_states).map(function (i) {
        if (i.startsWith("key_")) {
          if (_this2.last_state) {
            if (_this2.last_state[i] == 0 && _this2.props.key_states[i] == 1) {
              _this2.key_status("_" + i.replace("key_", ""), _this2.keyState.note_on);
            } else if (_this2.last_state[i] == 1 && _this2.props.key_states[i] == 0) {
              _this2.key_status("_" + i.replace("key_", ""), _this2.keyState.note_off);
            }
          }
          _temp[i] = _this2.props.key_states[i];
        }
      });
      this.last_state = _temp;
      return _react2.default.createElement(
        'div',
        { className: 'piano_renderer' },
        _react2.default.createElement('canvas', { id: this.state.canvas_id, style: { width: "100%", height: "100%" } })
      );
    }
  }]);

  return PianoComponent;
}(_react2.default.Component);

PianoComponent.defaultProps = {
  key_states: {},
  key_attack_time: 9.0,
  key_max_rotation: 0.72,
  octave: 2,
  noFloor: false,
  backgroundColor: 0xffffff
};
exports.default = PianoComponent;