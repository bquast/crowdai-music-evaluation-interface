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
        <MidiPlayerComponent onNoteOn={this.OnNoteOn.bind(this)} onNoteOff={this.OnNoteOff.bind(this)} resetKeyBoard={this.resetKeyBoard}/>
        <PianoComponent key_states={this.state}/>
      </div>
    );
  }
}

export default App;
