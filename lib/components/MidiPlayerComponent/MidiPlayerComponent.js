'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _midiPlayerJs = require('midi-player-js');

var _midiPlayerJs2 = _interopRequireDefault(_midiPlayerJs);

var _soundfontPlayer = require('soundfont-player');

var _soundfontPlayer2 = _interopRequireDefault(_soundfontPlayer);

var _reactPlayerControls = require('react-player-controls');

var _reactSimpleFlexGrid = require('react-simple-flex-grid');

var _reactIconsKit = require('react-icons-kit');

var _reactIconsKit2 = _interopRequireDefault(_reactIconsKit);

var _play = require('react-icons-kit/fa/play');

var _pause = require('react-icons-kit/fa/pause');

var _copy = require('react-icons-kit/fa/copy');

var _heart = require('react-icons-kit/fa/heart');

require('react-simple-flex-grid/lib/main.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioContext = window.AudioContext || window.webkitAudioContext || false;

var MidiPlayerComponent = function (_Component) {
  _inherits(MidiPlayerComponent, _Component);

  function MidiPlayerComponent(props) {
    _classCallCheck(this, MidiPlayerComponent);

    var _this = _possibleConstructorReturn(this, (MidiPlayerComponent.__proto__ || Object.getPrototypeOf(MidiPlayerComponent)).call(this, props));

    _this.state = {
      isLoading: true,
      isPlayEnabled: false,
      isPauseEnabled: false,
      isHeartEnabled: false,
      isInstrument_loaded: false,
      isMIDIFileLoaded: false,
      isSeekable: true,
      isMuted: false,
      currentTime: 0,
      totalTime: 0,
      status_message: 'Loading Instruments 🎻 🎷 🎺 🎸 🥁 ...',
      largeIconSize: 60
    };

    _this.load_data_uri = _this.load_data_uri.bind(_this);
    _this.instrument_loaded = _this.instrument_loaded.bind(_this);
    _this.player_fileLoaded = _this.player_fileLoaded.bind(_this);
    _this.player_playing = _this.player_playing.bind(_this);
    _this.player_midiEvent = _this.player_midiEvent.bind(_this);
    _this.player_endOfFile = _this.player_endOfFile.bind(_this);
    _this.playSong = _this.playSong.bind(_this);
    _this.pauseSong = _this.pauseSong.bind(_this);

    _this.audio_context = new AudioContext();
    _this.instrument = false;

    _soundfontPlayer2.default.instrument(new AudioContext(), 'acoustic_grand_piano').then(_this.instrument_loaded);

    _this.Player = new _midiPlayerJs2.default.Player();
    _this.Player.on('fileLoaded', _this.player_fileLoaded);
    _this.Player.on('playing', _this.player_playing);
    _this.Player.on('midiEvent', _this.player_midiEvent);
    _this.Player.on('endOfFile', _this.player_endOfFile);
    // this.Player.playLoop(false);
    _this.note_states = {};
    return _this;
  }

  _createClass(MidiPlayerComponent, [{
    key: 'player_fileLoaded',
    value: function player_fileLoaded() {
      console.log("fileLoaded");
      //This is where the UI for Play/Pause etc will be enabled
      var totalTime = this.Player.getSongTime();
      var currentTime = this.Player.getSongTime() - this.Player.getSongTimeRemaining();

      this.setState({ isMIDIFileLoaded: true, totalTime: totalTime, currentTime: 0, isPlayEnabled: this.state.isInstrument_loaded ? true : false, isPauseEnabled: false, status_message: "" });
      // this.Player.play()
    }
  }, {
    key: 'player_playing',
    value: function player_playing(currentTick) {
      // console.log("Play Remainnig : ", this.Player.getSongTimeRemaining());
      var totalTime = this.Player.getSongTime();
      var currentTime = this.Player.getSongTime() - this.Player.getSongTimeRemaining();
      this.setState({ totalTime: totalTime, currentTime: currentTime, isPlayEnabled: false, isPauseEnabled: true });

      if (this.Player.getSongTimeRemaining() <= 0) {
        this.player_endOfFile();
      }
    }
  }, {
    key: 'player_midiEvent',
    value: function player_midiEvent(event) {
      if (event.name == "Note on") {
        if (event.velocity <= 0) {
          //Register a NOTE_OFF
          this.props.onNoteOff(event.noteNumber);
          this.note_states[event.noteNumber] = 'stopped';
        } else {
          this.instrument.play(event.noteNumber, this.audio_context.current_time, { gain: event.velocity / 100.0 });
          this.props.onNoteOn(event.noteNumber);
          this.note_states[event.noteNumber] == 'playing';
          // Register a Note ON
        }
      } else if (event.name == "Note off") {
        // console.log(event);
        //Register a NoteOff
        this.props.onNoteOff(event.noteNumber);
        this.note_states[event.noteNumber] = 'stopped';
      }
    }
  }, {
    key: 'player_endOfFile',
    value: function player_endOfFile() {
      this.Player.skipToSeconds(0);
      this.Player.stop();
      this.setState({ isPlayEnabled: true, isPauseEnabled: false, currentTime: this.Player.getSongTime() });
      this.props.resetKeyBoard();
    }
  }, {
    key: 'instrument_loaded',
    value: function instrument_loaded(_instrument) {
      this.instrument = _instrument;
      this.setState({ instrument_loaded: true, isPlayEnabled: this.state.isMIDIFileLoaded ? true : false });
      console.log("Instrument Loaded...");
    }
  }, {
    key: 'load_data_uri',
    value: function load_data_uri() {
      this.setState({ status_message: "Loading MIDI file." });
      this.Player.loadDataUri(this.props.dataUri);
      // if(this.props.playOnLoad){
      //   this.playSong();
      // }
    }
  }, {
    key: 'playSong',
    value: function playSong() {
      this.Player.play();
      // this.setState({isPlayEnabled: false, isPauseEnabled: true, currentTime: this.Player.getSongTime()});
    }
  }, {
    key: 'pauseSong',
    value: function pauseSong() {
      this.Player.pause();
      this.setState({ isPlayEnabled: true, isPauseEnabled: false });
      this.props.resetKeyBoard();
    }
  }, {
    key: 'onSeekStart',
    value: function onSeekStart(time) {
      this.pauseSong();
    }
  }, {
    key: 'onSeekEnd',
    value: function onSeekEnd(time) {
      this.Player.skipToSeconds(time);
      this.playSong();
    }
  }, {
    key: 'renderPlayPause',
    value: function renderPlayPause() {
      if (this.state.isPlayEnabled) {
        return _react2.default.createElement(
          'button',
          {
            className: 'crowdai_music_challenge_btns btn',
            disabled: !this.state.isPlayEnabled,
            onClick: this.playSong,
            'data-rh': 'Play Song',
            'data-rh-at': 'left'
          },
          _react2.default.createElement(_reactIconsKit2.default, { icon: _play.play, size: this.state.largeIconSize })
        );
      } else if (this.state.isPauseEnabled) {
        return _react2.default.createElement(
          'button',
          {
            className: 'crowdai_music_challenge_btns btn',
            disabled: this.state.isPlayEnabled,
            onClick: this.pauseSong,
            'data-rh': 'Pause Song',
            'data-rh-at': 'left'
          },
          _react2.default.createElement(_reactIconsKit2.default, { icon: _pause.pause, size: this.state.largeIconSize })
        );
      } else {
        return _react2.default.createElement(
          'button',
          {
            className: 'crowdai_music_challenge_btns btn',
            disabled: !this.state.isPlayEnabled,
            onClick: this.playSong,
            'data-rh': 'Loading \uD83C\uDFB5',
            'data-rh-at': 'left'
          },
          _react2.default.createElement(_reactIconsKit2.default, { icon: _play.play, size: this.state.largeIconSize })
        );
      }
    }
  }, {
    key: 'renderProgressBar',
    value: function renderProgressBar() {
      var _this2 = this;

      return _react2.default.createElement(_reactPlayerControls.ProgressBar, {
        totalTime: this.state.totalTime,
        currentTime: this.state.currentTime,
        isSeekable: this.state.isSeekable,
        onSeek: function onSeek(time) {
          return _this2.setState(function () {
            return { currentTime: time };
          });
        },
        onSeekStart: this.onSeekStart.bind(this),
        onSeekEnd: this.onSeekEnd.bind(this)

        // onSeekStart={time => this.setState(() => ({ lastSeekStart: time }))}
        // onSeekEnd={time => this.setState(() => ({ lastSeekEnd: time }))}
        // onIntent={time => this.setState(() => ({ lastIntent: time }))}
      });
    }
  }, {
    key: 'renderTimeMarker',
    value: function renderTimeMarker() {
      return _react2.default.createElement(_reactPlayerControls.TimeMarker, {
        totalTime: this.state.totalTime,
        currentTime: Math.max(0, this.state.currentTime),
        markerSeparator: " /"
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.dataUri != this.dataUri) {
        this.load_data_uri();
        this.dataUri = this.props.dataUri;
        return null;
      }

      if (this.state.currentTime != 0 && this.state.totalTime != 0 && this.state.currentTime * 1.0 / this.state.totalTime > 0.2) {
        this.state.isHeartEnabled = true;
      }
      return _react2.default.createElement(
        'div',
        { className: 'controlsWrapper' },
        _react2.default.createElement(
          _reactSimpleFlexGrid.Row,
          { gutter: '20', justify: 'center' },
          _react2.default.createElement(
            _reactSimpleFlexGrid.Col,
            { xs: { span: 4 }, sm: { span: 3 }, md: { span: 3 }, lg: { span: 3 }, xl: { span: 3 } },
            this.renderPlayPause()
          ),
          _react2.default.createElement(
            _reactSimpleFlexGrid.Col,
            { xs: { span: 4 }, sm: { span: 3 }, md: { span: 3 }, lg: { span: 3 }, xl: { span: 3 } },
            _react2.default.createElement(
              'button',
              {
                className: 'crowdai_music_challenge_btns btn share_button',
                disabled: !this.state.isHeartEnabled,
                'data-rh': this.state.isHeartEnabled ? "Vote for this song !" : "You can vote for this song only after listening to it ;)",
                'data-rh-at': 'bottom'

              },
              _react2.default.createElement(_reactIconsKit2.default, { icon: _heart.heart, size: this.state.largeIconSize })
            )
          )
        ),
        _react2.default.createElement(
          _reactSimpleFlexGrid.Row,
          { align: 'middle', justify: 'center' },
          _react2.default.createElement(
            _reactSimpleFlexGrid.Col,
            { xs: 7, sm: 7, md: 7, lg: 8, xl: 10 },
            this.renderProgressBar()
          ),
          _react2.default.createElement(
            _reactSimpleFlexGrid.Col,
            { xs: 3, sm: 3, md: 3, lg: 2, xl: 1 },
            this.renderTimeMarker()
          ),
          _react2.default.createElement(
            _reactSimpleFlexGrid.Col,
            { xs: 0, sm: 2, md: 2, lg: 2, xl: 1 },
            _react2.default.createElement(
              'button',
              {
                className: 'crowdai_music_challenge_btns btn share_button',
                disabled: true,
                'data-rh': 'Unique link to this song',
                'data-rh-at': 'bottom'
              },
              _react2.default.createElement(_reactIconsKit2.default, { icon: _copy.copy })
            )
          )
        )
      );
    }
  }]);

  return MidiPlayerComponent;
}(_react.Component);

MidiPlayerComponent.defaultProps = {
  playOnLoad: false
  // dataUri: "data:audio/midi;base64,TVRoZAAAAAYAAQACAQBNVHJrAAAAGgD/WAQEAhgIAP9ZAv8AAP9YBAMCGAgB/y8ATVRyawAAAagAsFsyALAKSQCwWzIAsApJALAAAACwIAAAwAAAkDxGgS2QPAATkDxIOpA8AAaQPlMAkDVJAJA5SIFnkD4AGZA8SIFnkDwAGZBBVYFOkDUAAJA5ABmQQQAZkEBPAJAwUQCQOlGDTpBAADKQPEeBLZA8ABOQPEgOkDAAAJA6ACyQPAAGkD5VAJAwUACQOk+BZ5A+ABmQPEWBZ5A8ABmQQ1qBTpAwAACQOgAZkEMAGZBBSwCQNUkAkDlJg06QQQAykDxFgS2QPAATkDxKDpA1AACQOQAskDwABpBIYwCQNU0AkDlPgWeQSAAZkEVKgWeQRQAZkEFCgU6QNQAAkDkAGZBBABmQQEkAkDVRAJA6VIFnkEAAGZA+RYFH/1EDOThwIJA+AAD/UQMJJ8AZkEZZgS2QRgAB/1EDOThwEpBGTg6QNQAAkDoAAP9RAwknwCyQRgAGkEVMAJA1SwCQOUuBZ5BFABmQQUGBTpA1AACQOQAZkEEAGZBDTQCQME4AkDpPgWeQQwAAkDAAAJA6ABmQQUkAkDVMAJA5TIVOkEEAAJA1AACQOQAB/y8A"
};
exports.default = MidiPlayerComponent;