import React, { Component } from 'react';
import './App.scss';
import {Header} from './views/Header';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
      </div>
    );
  }
}

export default App;
