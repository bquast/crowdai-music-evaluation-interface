import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PianoComponent from './PianoComponent.js';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      key_states : new Array(80).fill(0)
    }
    this.interval = this.interval.bind(this);
    window.setInterval(this.interval, 1000)
  }
  interval(){
    var _states = []
    for(var i = 0; i< 80; i++){
      if(Math.random() < 0.05){
        _states.push(1);
      }else{
        _states.push(0);
      }
    }
    this.setState({key_states : _states});
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Mohanty</h1>
        </header>

        <PianoComponent key_states={this.state.key_states}/>
      </div>
    );
  }
}

export default App;
