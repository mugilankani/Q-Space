import React, { useState, useRef } from "react";

export default function Chat() {
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [chatMessage, setBotMessage] = useState();
  const chatboxRef = useRef(null);
  const userInputRef = useRef(null);

  const toggleChatbox = () => {
    setIsChatboxOpen(!isChatboxOpen);
  };

  // Function to add a user message to the chat
  const addUserMessage = (message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("mb-2", "text-right");
    messageElement.innerHTML = `<p class="bg-indigo-950 border border-indigo-800 text-white rounded-lg py-2 px-4 inline-block">${message}</p>`;
    chatboxRef.current.appendChild(messageElement);
    chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
  };

  // Function to add a bot message to the chat
  const addBotMessage = (message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("mb-2");
    messageElement.innerHTML = `<p class="bg-black border border-white/25 text-white rounded-lg py-2 px-4 inline-block">${message}</p>`;
    chatboxRef.current.appendChild(messageElement);
    chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
  };

  // Function to handle user message input
  const respondToUser = async (userMessage) => {
    let message;
    await fetch(`${import.meta.env.VITE_API_URI}/generate-answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: userMessage,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setBotMessage(data);
        message = data.text;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
    setTimeout(() => {
      addBotMessage(message);
    }, 500);
  };

  const handleSendMessage = () => {
    const userMessage = userInputRef.current.value;
    if (userMessage.trim() !== "") {
      addUserMessage(userMessage);
      respondToUser(userMessage);
      userInputRef.current.value = "";
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 mb-4 mr-4">
        <button
          id="open-chat"
          onClick={toggleChatbox}
          className="bg-white text-black py-2 px-4 pl-3 rounded-full hover:bg-gray-50 font-semibold transition duration-300 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.25"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Chat about content
        </button>
      </div>
      {isChatboxOpen && (
        <div
          id="chat-container"
          className="fixed bottom-16 right-4 w-96 shadow-2xl drop-shadow-2xl"
        >
          <div className="bg-[#111] shadow-md rounded-xl max-w-lg w-full">
            <div className="px-4 py-3 border-b border-white/20 flex justify-between items-center">
              <p className="text-lg font-semibold mt-1">Chat about content</p>
              <button
                id="close-chat"
                onClick={toggleChatbox}
                className="p-2 border-white/25"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div
              id="chatbox"
              ref={chatboxRef}
              className="p-4 h-80 flex flex-col overflow-y-auto"
            >
              {/* Chat messages will be displayed here */}
            </div>
            <div className="p-4 border-t border-white/20 flex">
              <input
                id="user-input"
                type="text"
                ref={userInputRef}
                placeholder="Type a message"
                className="w-full px-3 pl-6 py-2 border border-white/20 rounded-l-full focus:outline-none focus:ring-1 focus:ring-indigo-400"
                onKeyPress={handleKeyPress}
              />
              <button
                id="send-button"
                onClick={handleSendMessage}
                className="bg-indigo-600 rounded-r-full pr-5 text-white px-4 py-2 hover:bg-indigo-700 transition duration-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
