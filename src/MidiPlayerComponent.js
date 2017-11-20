import React, { Component } from 'react';

import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';
import {PlayButton, PauseButton, ProgressBar, TimeMarker} from 'react-player-controls';
import { Row, Col } from 'react-simple-flex-grid';
import "react-simple-flex-grid/lib/main.css";

var AudioContext = window.AudioContext || window.webkitAudioContext || false;


class MidiPlayerComponent extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoading: true,
      isPlayEnabled: false,
      isPauseEnabled: false,
      isInstrument_loaded: false,
      isMIDIFileLoaded: false,
      isSeekable: true,
      isMuted: false,
      currentTime: 0,
      totalTime: 0,
      status_message: 'Loading Instruments 🎻 🎷 🎺 🎸 🥁 ...'
    }

    this.load_data_uri = this.load_data_uri.bind(this);
    this.instrument_loaded = this.instrument_loaded.bind(this);
    this.player_fileLoaded = this.player_fileLoaded.bind(this);
    this.player_playing = this.player_playing.bind(this);
    this.player_midiEvent = this.player_midiEvent.bind(this);
    this.player_endOfFile = this.player_endOfFile.bind(this);
    this.playSong = this.playSong.bind(this);
    this.pauseSong = this.pauseSong.bind(this);

    this.audio_context = new AudioContext();
    this.instrument = false;

    Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano').then(this.instrument_loaded);

    this.Player = new MidiPlayer.Player();
    this.Player.on('fileLoaded', this.player_fileLoaded);
    this.Player.on('playing', this.player_playing);
    this.Player.on('midiEvent', this.player_midiEvent);
    this.Player.on('endOfFile', this.player_endOfFile);
    // this.Player.playLoop(false);
    this.note_states = {}
  }
  player_fileLoaded(){
    console.log("fileLoaded");
    //This is where the UI for Play/Pause etc will be enabled
    let totalTime = this.Player.getSongTime();
    let currentTime = this.Player.getSongTime() - this.Player.getSongTimeRemaining();

    this.setState({isMIDIFileLoaded:true, totalTime: totalTime, currentTime: 0, isPlayEnabled: this.state.isInstrument_loaded ? true: false, isPauseEnabled: false, status_message: ""});
    // this.Player.play()
  }
  player_playing(currentTick){
    // console.log("Play Remainnig : ", this.Player.getSongTimeRemaining());
    let totalTime = this.Player.getSongTime();
    let currentTime = this.Player.getSongTime() - this.Player.getSongTimeRemaining();
    this.setState({totalTime: totalTime, currentTime: currentTime, isPlayEnabled: false, isPauseEnabled: true});

    if(this.Player.getSongTimeRemaining() <= 0){
      this.player_endOfFile();
    }
  }
  player_midiEvent(event){
    if(event.name == "Note on"){
      if(event.velocity <= 0){
          //Register a NOTE_OFF
          this.props.onNoteOff(event.noteNumber);
          this.note_states[event.noteNumber] = 'stopped';
      }else{
        this.instrument.play(event.noteNumber, this.audio_context.current_time, {gain: event.velocity/100.0});
        this.props.onNoteOn(event.noteNumber);
        this.note_states[event.noteNumber] == 'playing'
        // Register a Note ON
      }
    }else if(event.name == "Note off"){
      // console.log(event);
      //Register a NoteOff
      this.props.onNoteOff(event.noteNumber);
      this.note_states[event.noteNumber] = 'stopped';
    }
  }
  player_endOfFile(){
    this.Player.skipToSeconds(0);
    this.Player.stop();
    this.setState({isPlayEnabled: true, isPauseEnabled: false, currentTime: this.Player.getSongTime()});
    this.props.resetKeyBoard();
  }
  instrument_loaded(_instrument){
    this.instrument = _instrument;
    this.setState({instrument_loaded: true, isPlayEnabled: this.state.isMIDIFileLoaded? true: false});
    console.log("Instrument Loaded...");
  }
  load_data_uri(){
    this.setState({status_message: "Loading MIDI file."});
    this.Player.loadDataUri(this.props.dataUri);
    // if(this.props.playOnLoad){
    //   this.playSong();
    // }
  }
  playSong(){
    this.Player.play();
    // this.setState({isPlayEnabled: false, isPauseEnabled: true, currentTime: this.Player.getSongTime()});
  }
  pauseSong(){
    this.Player.pause();
    this.setState({isPlayEnabled: true, isPauseEnabled: false});
    this.props.resetKeyBoard();
  }
  onSeekStart(time){
    this.pauseSong();
  }
  onSeekEnd(time){
    this.Player.skipToSeconds(time);
    this.playSong();
  }
  renderPlayPause(){
    if(this.state.isPlayEnabled){
      return (
        <PlayButton
          isEnabled={this.state.isPlayEnabled}
          onClick={this.playSong}
        />
      );
    }else if(this.state.isPauseEnabled){
      return (
        <PauseButton
          isEnabled={!this.state.isPlayEnabled}
          onClick={this.pauseSong}
        />
      )
    }else{
      return (<PlayButton
        isEnabled={this.state.isPlayEnabled}
        onClick={this.playSong}
              />
            )
    }

  }
  renderProgressBar(){
    return(
      <ProgressBar
        totalTime={this.state.totalTime}
        currentTime={this.state.currentTime}
        isSeekable={this.state.isSeekable}
        onSeek={time => this.setState(() => ({ currentTime: time }))}
        onSeekStart={this.onSeekStart.bind(this)}
        onSeekEnd={this.onSeekEnd.bind(this)}

        // onSeekStart={time => this.setState(() => ({ lastSeekStart: time }))}
        // onSeekEnd={time => this.setState(() => ({ lastSeekEnd: time }))}
        // onIntent={time => this.setState(() => ({ lastIntent: time }))}
      />
    );
  }
  renderTimeMarker(){
    return (
      <TimeMarker
        totalTime={this.state.totalTime}
        currentTime={Math.max(0, this.state.currentTime)}
        markerSeparator={"/"}
      />
    );
  }
  render() {
    if(this.props.dataUri != this.dataUri){
      this.load_data_uri()
      this.dataUri = this.props.dataUri;
      return null;
    }
    return (

        <Row className="controlsWrapper" align="middle" justify="center">
          <Col xs={2} sm={2} md={1} lg={1} xl={1}>
            {this.renderPlayPause()}
          </Col>
          <Col xs={0} sm={7} md={9} lg={9} xl={9}>
            {this.renderProgressBar()}
          </Col>
          <Col xs={10} sm={3} md={2} lg={2} xl={2}>
            {this.renderTimeMarker()}
          </Col>
        </Row>
    );
  }
}
MidiPlayerComponent.defaultProps = {
  playOnLoad: false,
  // dataUri: "data:audio/midi;base64,TVRoZAAAAAYAAQACAQBNVHJrAAAAGgD/WAQEAhgIAP9ZAv8AAP9YBAMCGAgB/y8ATVRyawAAAagAsFsyALAKSQCwWzIAsApJALAAAACwIAAAwAAAkDxGgS2QPAATkDxIOpA8AAaQPlMAkDVJAJA5SIFnkD4AGZA8SIFnkDwAGZBBVYFOkDUAAJA5ABmQQQAZkEBPAJAwUQCQOlGDTpBAADKQPEeBLZA8ABOQPEgOkDAAAJA6ACyQPAAGkD5VAJAwUACQOk+BZ5A+ABmQPEWBZ5A8ABmQQ1qBTpAwAACQOgAZkEMAGZBBSwCQNUkAkDlJg06QQQAykDxFgS2QPAATkDxKDpA1AACQOQAskDwABpBIYwCQNU0AkDlPgWeQSAAZkEVKgWeQRQAZkEFCgU6QNQAAkDkAGZBBABmQQEkAkDVRAJA6VIFnkEAAGZA+RYFH/1EDOThwIJA+AAD/UQMJJ8AZkEZZgS2QRgAB/1EDOThwEpBGTg6QNQAAkDoAAP9RAwknwCyQRgAGkEVMAJA1SwCQOUuBZ5BFABmQQUGBTpA1AACQOQAZkEEAGZBDTQCQME4AkDpPgWeQQwAAkDAAAJA6ABmQQUkAkDVMAJA5TIVOkEEAAJA1AACQOQAB/y8A"
}
export default MidiPlayerComponent;
