import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Routes, HashRouter as Router } from 'react-router-dom';
import './index.css';
import { LampConfigurator } from './LampConfigurator';
import { TestingDataParser } from './components/dataParsingVisualization/TestingDataParser';

const SimpleApp = () => <div>Very simple app?</div>;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<div>hello world</div>} path='/' />
        <Route element={<SimpleApp />} path='/simple' />
        <Route element={<LampConfigurator />} path='/configurator/:stateString' />
        <Route element={<TestingDataParser />} path='/dataParserTest' />
      </Routes>
    </Router>
  </React.StrictMode>
);
