import React, { Component } from 'react';
import PianoComponent from './PianoComponent.js';
import MidiPlayerComponent from './MidiPlayerComponent.js';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
    }
    this.octave = 2;
    this.max_number_of_piano_keys = 80;

    this.resetKeyBoard = this.resetKeyBoard.bind(this);

    this.resetKeyBoard();
  }
  resetKeyBoard(){
    for(var i = 0; i<this.max_number_of_piano_keys; i++){
      this.state["key_"+i] = 0;
    }
    this.setState(this.state);
  }
  OnNoteOn(noteNumber){
    if(noteNumber > this.octave*2 + this.max_number_of_piano_keys){
      return;
    }
    let key = "key_"+ (noteNumber - this.octave*12);
    this.state[key] = 1;
    this.setState(this.state);
  }
  OnNoteOff(noteNumber){
    if(noteNumber > this.octave*2 + this.max_number_of_piano_keys){
      return;
    }
    let key = "key_"+(noteNumber - this.octave*12)
    this.state[key] = 0;
    this.setState(this.state);
  }
  render() {
    return (
      <div>
        <div className="midi-player">
          <MidiPlayerComponent onNoteOn={this.OnNoteOn.bind(this)} onNoteOff={this.OnNoteOff.bind(this)} dataUri={this.props.song} resetKeyBoard={this.resetKeyBoard}/>
        </div>
        <div className="piano-component">
          <PianoComponent key_states={this.state}/>
        </div>
      </div>
    );
  }
}
App.defaultProps = {
  song: "data:audio/midi;base64,TVRoZAAAAAYAAQACAQBNVHJrAAAAGgD/WAQEAhgIAP9ZAv8AAP9YBAMCGAgB/y8ATVRyawAAAagAsFsyALAKSQCwWzIAsApJALAAAACwIAAAwAAAkDxGgS2QPAATkDxIOpA8AAaQPlMAkDVJAJA5SIFnkD4AGZA8SIFnkDwAGZBBVYFOkDUAAJA5ABmQQQAZkEBPAJAwUQCQOlGDTpBAADKQPEeBLZA8ABOQPEgOkDAAAJA6ACyQPAAGkD5VAJAwUACQOk+BZ5A+ABmQPEWBZ5A8ABmQQ1qBTpAwAACQOgAZkEMAGZBBSwCQNUkAkDlJg06QQQAykDxFgS2QPAATkDxKDpA1AACQOQAskDwABpBIYwCQNU0AkDlPgWeQSAAZkEVKgWeQRQAZkEFCgU6QNQAAkDkAGZBBABmQQEkAkDVRAJA6VIFnkEAAGZA+RYFH/1EDOThwIJA+AAD/UQMJJ8AZkEZZgS2QRgAB/1EDOThwEpBGTg6QNQAAkDoAAP9RAwknwCyQRgAGkEVMAJA1SwCQOUuBZ5BFABmQQUGBTpA1AACQOQAZkEEAGZBDTQCQME4AkDpPgWeQQwAAkDAAAJA6ABmQQUkAkDVMAJA5TIVOkEEAAJA1AACQOQAB/y8A"
}

export default App;
