import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

// Initialize Firebase (replace with your own config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const FirebaseChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const messagesRef = firebase.database().ref('messages');
    messagesRef.on('value', (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messageList = Object.entries(messagesData).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setMessages(messageList);
      }
    });

    return () => messagesRef.off();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messagesRef = firebase.database().ref('messages');
      const newMessageRef = messagesRef.push();
      newMessageRef.set({
        text: newMessage,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
      setNewMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Firebase Chat</h2>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: '5px' }}>
            <strong>{new Date(message.timestamp).toLocaleTimeString()}</strong>: {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flexGrow: 1, marginRight: '10px', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '5px 10px' }}>Send</button>
      </form>
    </div>
  );
};

export default FirebaseChat;
