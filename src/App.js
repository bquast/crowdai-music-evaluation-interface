import React, { Component } from 'react';
import PianoComponent from './PianoComponent.js';
import MidiPlayerComponent from './MidiPlayerComponent.js';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      key_states : new Array(80).fill(0)
    }
  }
  OnNoteOn(noteNumber){
    console.log("NOte ON ", noteNumber)
  }
  OnNoteOff(noteNumber){
    console.log("NOte Off ", noteNumber)
  }
  // interval(){
  //   var _states = []
  //   for(var i = 0; i< 80; i++){
  //     if(Math.random() < 0.05){
  //       _states.push(1);
  //     }else{
  //       _states.push(0);
  //     }
  //   }
  //   this.setState({key_states : _states});
  // }
  render() {
    return (
      <div>
        <MidiPlayerComponent onNoteOn={this.OnNoteOn.bind(this)} onNoteOff={this.OnNoteOff.bind(this)}/>
        <PianoComponent key_states={this.state.key_states}/>
      </div>
    );
  }
}

export default App;
