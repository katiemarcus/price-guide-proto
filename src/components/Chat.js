import React, { useState } from 'react';
import './Chat.css'; // Import the CSS file

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [item, setItem] = useState('');
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');

  const itemOptions = ['Top', 'Trousers', 'Skirt', 'Dress', 'Knitwear', 'Outerwear', 'Bag', 'Shoes', 'Other'];
  const serviceOptions = ['Repair', 'Alteration', 'Other'];

  const handleItemClick = (selectedItem) => {
    setItem(selectedItem);
    if (selectedItem === 'Other') {
      const bespokeMessage = {
        text: "You'll need a bespoke quote from a Maker to get an accurate price for this. Please continue to make a booking, telling us more about your item.",
        sender: 'bot'
      };
      setMessages([...messages, bespokeMessage]);
    }
  };

  const handleServiceClick = (selectedService) => {
    setService(selectedService);
    if (selectedService === 'Other') {
      const bespokeMessage = {
        text: "You'll need a bespoke quote from a Maker to get an accurate price for this. Please continue to make a booking, telling more about your item.",
        sender: 'bot'
      };
      setMessages([...messages, bespokeMessage]);
    }
  };

  const sendMessage = async () => {
    const newMessage = { text: description, sender: 'user' };
    setMessages([...messages, newMessage]);

    try {
      const response = await fetch('/api/get-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item, service, description }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage = { text: data.message, sender: 'bot' };
      setMessages([...messages, newMessage, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: 'There was an error processing your request. Please try again later.', sender: 'bot' };
      setMessages([...messages, newMessage, errorMessage]);
    } finally {
      setDescription('');
    }
  };

  return (
    <div className="chat-container">
      <div className="selection-container">
        <h3>Select Item</h3>
        <div className="button-group">
          {itemOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleItemClick(option)}
              className={item === option ? 'selected' : ''}
            >
              {option}
            </button>
          ))}
        </div>
        <h3>Select Service</h3>
        <div className="button-group">
          {serviceOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleServiceClick(option)}
              className={service === option ? 'selected' : ''}
            >
              {option}
            </button>
          ))}
        </div>
        {(item && service) && item !== 'Other' && service !== 'Other' && (
          <div className="input-container">
            <input
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )}
      </div>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;