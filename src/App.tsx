import React from 'react';
import logo from './logo.svg';
import './App.scss';
import GaistAI from './GaistAI';

function App() {
  return (
    <div className='gaist-client-wrapper'>
      <div className='gaist-client-chatzone'>
        <div className='gaist-client-box'>
          <GaistAI/>
        </div>
      </div>
    </div>
  );
}

export default App;
