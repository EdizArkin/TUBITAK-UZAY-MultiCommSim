import React from 'react';
import CommSimViz from './components/CommSimViz';
import './index.css';  // veya commsimviz.css içindeyse ona göre yol


function App() {
  return (
    <div className="App">
      <h1>MultiCommSim Visualizer</h1>
      <CommSimViz />
    </div>
  );
}

export default App;
