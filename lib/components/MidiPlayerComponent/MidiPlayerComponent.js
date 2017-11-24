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
      submission_id: "something",
      isLoading: true,
      isPlayEnabled: false,
      hasPlayedOnce: false,
      isPauseEnabled: false,
      isHeartEnabled: false,
      isInstrument_loaded: false,
      isMIDIFileLoaded: false,
      isSeekable: true,
      isMuted: false,
      currentTime: 0,
      totalTime: 0,
      status_message: 'Loading Instruments 🎻 🎷 🎺 🎸 🥁 ...',
      largeIconSize: 50
    };

    _this.load_data_uri = _this.load_data_uri.bind(_this);
    _this.instrument_loaded = _this.instrument_loaded.bind(_this);
    _this.player_fileLoaded = _this.player_fileLoaded.bind(_this);
    _this.player_playing = _this.player_playing.bind(_this);
    _this.player_midiEvent = _this.player_midiEvent.bind(_this);
    _this.player_endOfFile = _this.player_endOfFile.bind(_this);
    _this.playSong = _this.playSong.bind(_this);
    _this.pauseSong = _this.pauseSong.bind(_this);
    _this.unlockAudioContext = _this.unlockAudioContext.bind(_this);
    _this.AudioContextUnlocked = false;

    _this.audio_context = new AudioContext();

    _this.instrument = false;

    _soundfontPlayer2.default.instrument(_this.audio_context, 'acoustic_grand_piano').then(_this.instrument_loaded);
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
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.load_data_uri(this.props.dataUri);
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {}
  }, {
    key: 'unlockAudioContext',
    value: function unlockAudioContext() {
      var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
      if (!iOS || this.AudioContextUnlocked) return;

      // create empty buffer and play it
      var buffer = this.audio_context.createBuffer(1, 1, 22050);
      var source = this.audio_context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audio_context.destination);
      if (source.start) {
        source.start(0);
      } else if (source.noteOn) {
        source.noteOn(0);
      }

      // by checking the play state after some time, we know if we're really unlocked
      setTimeout(function () {
        if (source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE) {
          this.AudioContextUnlocked = true;
        }
      }, 0);
    }
  }, {
    key: 'player_fileLoaded',
    value: function player_fileLoaded() {
      //This is where the UI for Play/Pause etc will be enabled
      var totalTime = this.Player.getSongTime();
      // let currentTime = this.Player.getSongTime() - this.Player.getSongTimeRemaining();

      this.setState({ isMIDIFileLoaded: true, totalTime: totalTime, currentTime: 0, isPlayEnabled: this.state.isInstrument_loaded ? true : false, isPauseEnabled: false, status_message: "" });
      if (this.state.isInstrument_loaded && this.state.isMIDIFileLoaded) {
        this.setState({ isLoading: false });
      }
    }
  }, {
    key: 'player_playing',
    value: function player_playing(currentTick) {
      // console.log("Play Remainnig : ", this.Player.getSongTimeRemaining());
      var totalTime = this.Player.getSongTime();
      var currentTime = this.Player.getSongTime() - this.Player.getSongTimeRemaining();
      var isHeartEnabled = false;
      if (this.state.currentTime !== 0 && this.state.totalTime !== 0 && this.state.currentTime * 1.0 / this.state.totalTime > 0.2) {
        isHeartEnabled = true;
      }

      this.setState({
        totalTime: totalTime,
        hasPlayedOnce: true,
        currentTime: currentTime,
        isPlayEnabled: false,
        isPauseEnabled: true,
        isHeartEnabled: isHeartEnabled
      });

      if (this.Player.getSongTimeRemaining() <= 0) {
        this.player_endOfFile();
      }
    }
  }, {
    key: 'player_midiEvent',
    value: function player_midiEvent(event) {
      if (event.name === "Note on") {
        if (event.velocity <= 0) {
          //Register a NOTE_OFF
          this.props.onNoteOff(event.noteNumber);
          this.note_states[event.noteNumber] = 'stopped';
        } else {
          this.instrument.play(event.noteNumber, this.audio_context.current_time, { gain: event.velocity / 100.0 });
          this.props.onNoteOn(event.noteNumber);
          this.note_states[event.noteNumber] = 'playing';
          // Register a Note ON
        }
      } else if (event.name === "Note off") {
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
      this.setState({ isInstrument_loaded: true, isPlayEnabled: this.state.isMIDIFileLoaded ? true : false });
      if (this.state.isInstrument_loaded && this.state.isMIDIFileLoaded) {
        this.setState({ isLoading: false });
      }
    }
  }, {
    key: 'load_data_uri',
    value: function load_data_uri(dataUri) {
      if (dataUri && dataUri !== this.dataUri) {
        this.setState({ status_message: "Loading MIDI file.", isMIDIFileLoaded: false });
        this.Player.loadDataUri(dataUri);
        this.datUri = dataUri;
      }
    }
  }, {
    key: 'playSong',
    value: function playSong() {
      this.setState({ isPlayEnabled: false, isPauseEnabled: true });
      this.unlockAudioContext();
      this.Player.play();
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
      var _this2 = this;

      if (this.state.isPlayEnabled) {
        var THIS = this;
        return _react2.default.createElement(
          'button',
          {
            className: 'crowdai_music_challenge_btns',
            disabled: !this.state.isPlayEnabled,
            onClick: function onClick() {
              _this2.props.onPlay(_this2.props.playerName);
            },
            'data-rh': 'Play Song',
            'data-rh-at': 'left'
          },
          _react2.default.createElement(_reactIconsKit2.default, { icon: _play.play, size: this.state.largeIconSize })
        );
      } else if (this.state.isPauseEnabled) {
        return _react2.default.createElement(
          'button',
          {
            className: 'crowdai_music_challenge_btns',
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
            className: 'crowdai_music_challenge_btns',
            disabled: !this.state.isPlayEnabled,
            onClick: function onClick() {
              _this2.props.onPlay(_this2.props.playerName);
            },
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
      var _this3 = this;

      return _react2.default.createElement(_reactPlayerControls.ProgressBar, {
        totalTime: this.state.totalTime,
        currentTime: this.state.currentTime,
        isSeekable: this.state.isSeekable,
        onSeek: function onSeek(time) {
          return _this3.setState(function () {
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
        markerSeparator: " / "
      });
    }
  }, {
    key: 'renderHeart',
    value: function renderHeart() {
      var _this4 = this;

      return _react2.default.createElement(
        'button',
        {
          className: 'crowdai_music_challenge_btns share_button',
          disabled: !this.state.isHeartEnabled,
          'data-rh': this.state.isHeartEnabled ? "Vote for this song !" : "You can vote for this song only after listening to it ;)",
          'data-rh-at': 'bottom',
          onClick: function onClick() {
            _this4.props.onHeartClicked(_this4.props.playerName);
          }
        },
        _react2.default.createElement(_reactIconsKit2.default, { icon: _heart.heart, size: this.state.largeIconSize })
      );
    }
  }, {
    key: 'renderSubmissionID',
    value: function renderSubmissionID() {
      if (this.state.submission_id) {
        return _react2.default.createElement(
          'pre',
          null,
          _react2.default.createElement(
            'strong',
            null,
            '#song',
            this.props.playerName + 1
          ),
          ' : ',
          this.state.submission_id.slice(0, 13)
        );
      } else {
        return _react2.default.createElement(
          'pre',
          null,
          "...."
        );
      }
    }
  }, {
    key: 'renderTopRow',
    value: function renderTopRow() {
      if (!this.state.isLoading) {
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactSimpleFlexGrid.Row,
            { gutter: '20', justify: 'center' },
            this.renderSubmissionID()
          ),
          _react2.default.createElement(
            _reactSimpleFlexGrid.Row,
            { gutter: '20', justify: 'center' },
            _react2.default.createElement(
              _reactSimpleFlexGrid.Col,
              { className: '', xs: { span: 5 }, sm: { span: 4 }, md: { span: 3 }, lg: { span: 3 }, xl: { span: 3 } },
              this.renderPlayPause()
            ),
            _react2.default.createElement(
              _reactSimpleFlexGrid.Col,
              { className: '', xs: { span: 5 }, sm: { span: 4 }, md: { span: 3 }, lg: { span: 3 }, xl: { span: 3 } },
              this.renderHeart()
            )
          )
        );
      } else {
        return _react2.default.createElement(
          _reactSimpleFlexGrid.Row,
          { gutter: 10, align: 'middle', justify: 'center' },
          _react2.default.createElement('div', { className: 'crowdai_interface_loader' })
        );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var active_state = "controlsWrapper_notactive";
      if (this.state.isPauseEnabled) {
        active_state = " controlsWrapper_active";
      }
      return _react2.default.createElement(
        'div',
        { className: "controlsWrapper " + active_state },
        this.renderTopRow(),
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
            { sm: 3, md: 3, lg: 2, xl: 1 },
            this.renderTimeMarker()
          ),
          _react2.default.createElement(
            _reactSimpleFlexGrid.Col,
            { className: 'hidden-xs', xs: 1, sm: 2, md: 2, lg: 2, xl: 1 },
            _react2.default.createElement(
              'button',
              {
                className: 'crowdai_music_challenge_btns share_button',
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