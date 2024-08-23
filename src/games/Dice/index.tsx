import React from 'react';
import ReactDOM from 'react-dom/client';
import FirebaseChat from './components/FirebaseChat';

const App: React.FC = () => {
  return (
    <div>
      <h1>Firebase Chat Test</h1>
      <FirebaseChat />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
