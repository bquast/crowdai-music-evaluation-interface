'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PianoComponent = require('../PianoComponent/PianoComponent.js');

var _PianoComponent2 = _interopRequireDefault(_PianoComponent);

var _MidiPlayerComponent = require('../MidiPlayerComponent/MidiPlayerComponent.js');

var _MidiPlayerComponent2 = _interopRequireDefault(_MidiPlayerComponent);

require('./CrowdAIMusicEvaluationInterface.css');

var _reactSimpleFlexGrid = require('react-simple-flex-grid');

require('react-simple-flex-grid/lib/main.css');

var _reactHint = require('react-hint');

var _reactHint2 = _interopRequireDefault(_reactHint);

require('react-hint/css/index.css');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _reactSkylight = require('react-skylight');

var _reactSkylight2 = _interopRequireDefault(_reactSkylight);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactHint = (0, _reactHint2.default)(_react2.default);

var CrowdAIMusicEvaluationInterface = function (_Component) {
  _inherits(CrowdAIMusicEvaluationInterface, _Component);

  function CrowdAIMusicEvaluationInterface(props) {
    _classCallCheck(this, CrowdAIMusicEvaluationInterface);

    var _this = _possibleConstructorReturn(this, (CrowdAIMusicEvaluationInterface.__proto__ || Object.getPrototypeOf(CrowdAIMusicEvaluationInterface)).call(this, props));

    _this.state = {};
    _this.octave = 2;
    _this.max_number_of_piano_keys = 80;

    _this.resetKeyBoard = _this.resetKeyBoard.bind(_this);
    _this.reloadData = _this.reloadData.bind(_this);
    _this.heartClicked = _this.heartClicked.bind(_this);
    _this.OnPlay = _this.OnPlay.bind(_this);
    _this.renderModal = _this.renderModal.bind(_this);
    _this.resetKeyBoard();
    _this.reloadData();

    //Modal States
    _this.state.modalLoading = true;
    _this.state.modalWinProbability = 0.5;

    return _this;
  }

  _createClass(CrowdAIMusicEvaluationInterface, [{
    key: 'heartClicked',
    value: function heartClicked(id) {
      var THIS = this;
      this.setState({ modalLoading: true });
      THIS.simpleDialog.show();
      _axios2.default.post(this.props.base_api_url + "/match/" + this.state.match_id, {
        winner: id
      }).then(function (response) {
        if (response.status === 200) {
          // Pause both the players if they are playing
          if (THIS.refs.midiplayer1.state.hasPlayedOnce) {
            THIS.refs.midiplayer1.pauseSong();
          }
          THIS.refs.midiplayer1.setState({
            isHeartEnabled: false,
            isPlayEnabled: false
          });
          if (THIS.refs.midiplayer0.state.hasPlayedOnce) {
            THIS.refs.midiplayer0.pauseSong();
          }
          THIS.refs.midiplayer0.setState({
            isHeartEnabled: false,
            isPlayEnabled: false
          });
          //Reset Keyboard
          THIS.resetKeyBoard();
          THIS.reloadData();

          THIS.setState({ modalWinProbability: response.data.prob_win, modalLoading: false });
          console.log(response);
        } else {
          // TODO : Add error handling
        }
      }).catch(function (error) {
        console.log(error);
      });
    }
  }, {
    key: 'reloadData',
    value: function reloadData() {
      var THIS = this;
      this.loadingData = true;
      // THIS.refs.midiplayer0.setState({isLoading: true});
      // THIS.refs.midiplayer1.setState({isLoading: true});
      var _state = this.state;
      _state.song1 = false;
      _state.song2 = false;
      _axios2.default.get(this.props.base_api_url + "/match").then(function (response) {
        THIS.loadingData = false;
        THIS.setState({ match_id: response.data.match_id });
        var candidate_1 = response.data.candidate_1;
        _axios2.default.get(candidate_1).then(function (response) {
          THIS.refs.midiplayer0.setState({ submission_id: response.data.key });
          THIS.refs.midiplayer0.load_data_uri(response.data.dataUri);
        });
        var candidate_2 = response.data.candidate_2;
        _axios2.default.get(candidate_2).then(function (response) {
          THIS.refs.midiplayer1.setState({ submission_id: response.data.key });
          THIS.refs.midiplayer1.load_data_uri(response.data.dataUri);
        });
      }).catch(function (error) {
        console.log(error);
      });
    }
  }, {
    key: 'resetKeyBoard',
    value: function resetKeyBoard() {
      var _new_state = {};
      for (var i = 0; i < this.max_number_of_piano_keys; i++) {
        _new_state["key_" + i] = 0;
      }
      this.setState(_new_state);
    }
  }, {
    key: 'OnNoteOn',
    value: function OnNoteOn(noteNumber) {
      if (noteNumber > this.octave * 2 + this.max_number_of_piano_keys) {
        return;
      }
      var key = "key_" + (noteNumber - this.octave * 12);
      var _new_state = {};
      _new_state[key] = 1;
      this.setState(_new_state);
    }
  }, {
    key: 'OnNoteOff',
    value: function OnNoteOff(noteNumber) {
      if (noteNumber > this.octave * 2 + this.max_number_of_piano_keys) {
        return;
      }
      var key = "key_" + (noteNumber - this.octave * 12);
      var _new_state = {};
      _new_state[key] = 0;
      this.setState(_new_state);
    }
  }, {
    key: 'OnPlay',
    value: function OnPlay(playerName) {
      if (playerName === 0) {
        if (this.refs.midiplayer1.state.hasPlayedOnce) {
          this.refs.midiplayer1.pauseSong();
        }
        this.refs.midiplayer0.playSong();
      } else {
        if (this.refs.midiplayer0.state.hasPlayedOnce) {
          this.refs.midiplayer0.pauseSong();
        }
        this.refs.midiplayer1.playSong();
      }
      //Stop all instances
      // this.refs.midiplayer0.pauseSong();
      // this.refs.midiplayer1.pauseSong();
      // midiplayer.playSong();
    }
  }, {
    key: 'renderModal',
    value: function renderModal() {
      var _this2 = this;

      var THIS = this;
      if (this.state.modalLoading) {
        return _react2.default.createElement(
          _reactSimpleFlexGrid.Row,
          { gutter: 10, align: 'middle', justify: 'center' },
          _react2.default.createElement('div', { className: 'crowdai_interface_loader' })
        );
      } else {
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactSimpleFlexGrid.Row,
            { gutter: 10, align: 'middle', justify: 'center' },
            _react2.default.createElement(
              'div',
              { style: { textAlign: "center" } },
              'Your choice had a probability of ',
              _react2.default.createElement(
                'strong',
                null,
                ' ',
                this.state.modalWinProbability,
                ' '
              ),
              ' to be chosen over the other song. ',
              _react2.default.createElement('br', null)
            )
          ),
          _react2.default.createElement(
            _reactSimpleFlexGrid.Row,
            { gutter: 10, align: 'middle', justify: 'center' },
            _react2.default.createElement(
              'button',
              { className: 'crowdai_music_challenge_btns', onClick: function onClick() {
                  _this2.simpleDialog.hide();
                } },
              'Load Next Song'
            )
          )
        );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactSkylight2.default,
          {
            hideOnOverlayClicked: true,
            ref: function ref(_ref) {
              return _this3.simpleDialog = _ref;
            },
            title: '' },
          this.renderModal()
        ),
        _react2.default.createElement(ReactHint, { events: true, delay: 100 }),
        _react2.default.createElement(
          _reactSimpleFlexGrid.Row,
          { className: 'CrowdAIMusicEvaluationInterfaceWrapper', justify: 'left' },
          _react2.default.createElement(
            _reactSimpleFlexGrid.Col,
            { span: 10, offset: 1 },
            _react2.default.createElement(
              _reactSimpleFlexGrid.Row,
              { gutter: 10, align: 'middle', justify: 'center' },
              _react2.default.createElement(
                _reactSimpleFlexGrid.Col,
                { xs: 11, sm: 6, md: 6, lg: 6, xl: 6 },
                _react2.default.createElement(_MidiPlayerComponent2.default, {
                  ref: 'midiplayer0',
                  playerName: 0,
                  dataUri: this.props.song1,
                  onNoteOn: this.OnNoteOn.bind(this),
                  onNoteOff: this.OnNoteOff.bind(this),
                  onPlay: this.OnPlay,
                  onHeartClicked: this.heartClicked,
                  resetKeyBoard: this.resetKeyBoard
                })
              ),
              _react2.default.createElement(
                _reactSimpleFlexGrid.Col,
                { xs: 11, sm: 6, md: 6, lg: 6, xl: 6 },
                _react2.default.createElement(_MidiPlayerComponent2.default, {
                  ref: 'midiplayer1',
                  playerName: 1,
                  dataUri: this.props.song1,
                  onNoteOn: this.OnNoteOn.bind(this),
                  onNoteOff: this.OnNoteOff.bind(this),
                  onPlay: this.OnPlay,
                  onHeartClicked: this.heartClicked,
                  resetKeyBoard: this.resetKeyBoard
                })
              )
            ),
            _react2.default.createElement(
              _reactSimpleFlexGrid.Row,
              { align: 'middle', justify: 'center' },
              _react2.default.createElement(
                _reactSimpleFlexGrid.Col,
                { span: 12 },
                _react2.default.createElement(_PianoComponent2.default, { key_states: this.state, noFloor: true })
              )
            )
          )
        )
      );
    }
  }]);

  return CrowdAIMusicEvaluationInterface;
}(_react.Component);

CrowdAIMusicEvaluationInterface.defaultProps = {
  base_api_url: "http://grader.crowdai.org:9271"
};

exports.default = CrowdAIMusicEvaluationInterface;