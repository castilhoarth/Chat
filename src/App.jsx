import React from 'react';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>GMF Smart Offers</h1>
      </header>
      <main className="app-main">
        <Chatbot />
      </main>
    </div>
  );
}

export default App;
