import React from 'react';
import ClaraChatEngine from './components/ClaraChatEngine';

export default function App() {
  return (
    <div className="clara360-app">
      <header className="app-header">
        <h1>Clara360 - Intelligente Hausverwaltung</h1>
      </header>
      <main className="app-main">
        <ClaraChatEngine />
      </main>
    </div>
  );
}
