import React, { useState, useEffect } from "react";
import Picture from "./images/market.png";
import Picture2 from "./images/market2.webp";
import ChatIcon from "./images/chat-icon.png";
import Ping from "./audio/ping.mp3";
import "./App.css";

function App() {
  const [messageData, setMessageData] = useState([]);
  const [input, setInput] = useState({ user: "" }, { messageBody: "" }, { room: "" });
  const [myUser, setMyUser] = useState("");
  const [currentRoom] = useState("Main");

  function handleChange(event) {
    let newInput = {
      ...input,
      [event.target.name]: event.target.value,
      room: currentRoom,
    };
    setInput(newInput);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    let checkInputArray = input.messageBody.split("");

    if (messageData.some(e => e.user === input.user)) {
      if (myUser !== "" && myUser === input.user) {
        if (checkInputArray.length <= 500) {
          let clearInput = { ...input, messageBody: "" };
          setInput(clearInput);

          let pingAudio = new Audio(Ping);
          pingAudio.play();

          await fetch("api/add-message", {
            headers: { "content-type": "application/json" },
            method: "POST",
            body: JSON.stringify(input),
          });
        } else {
          alert("Please input another name or message body less than 500 characters...");
        }
      }
      alert("Please input another name...");
    } else {
      if (checkInputArray.length <= 500) {
        let clearInput = { ...input, messageBody: "" };
        setInput(clearInput);
        setMyUser(input.user);

        let pingAudio = new Audio(Ping);
        pingAudio.play();

        await fetch("api/add-message", {
          headers: { "content-type": "application/json" },
          method: "POST",
          body: JSON.stringify(input),
        });
      } else {
        alert("Please input another name or message body less than 500 characters...");
      }
    }
  }
    async function clearOldMessages() {
      await fetch("api/clear-messages");
    }
    useEffect(() => {
      clearOldMessages()
    }, []);

    async function getData() {
      let allMessages = await fetch("api/get-all-messages");
      allMessages = await allMessages.json();
      allMessages.forEach((message) => {
        if (message.dateCreated) {
          message.when = new Date(message.dateCreated).toLocaleString();
        }
      });
      setMessageData(allMessages.reverse());
    }
    useEffect(() => {
      const fetchNewData = () => {
        getData();
        setTimeout(fetchNewData, 2000);
      };
      setTimeout(fetchNewData, 2000);
    }, []);

    let images = [Picture, Picture2];

    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
      const intervalId = setInterval(() => {
        if (currentImage === images.length - 1) {
          setCurrentImage(0);
        } else {
          setCurrentImage(currentImage + 1);
        }
      }, 10000);

      return () => clearInterval(intervalId);
    }, [currentImage, images.length]);

    return (
      <main>
        <header id="header">
          <h1>React Chat</h1>
          <img src={ChatIcon} alt="some chat bubbles" />
        </header>
        <div id="body-container">
          <div id="top-screen">
            <div id="rooms">
              <div className="video-responsive">
                <iframe
                  width="100%"
                  height="480"
                  src="https://www.youtube.com/embed/-JgtW_vFgEY"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="video"
                />
              </div>
            </div>
          </div>

          <div id="bottom-screen">
            <div id="chat-box">
              {messageData.map((message, i) => {
                if (message.room === currentRoom) {
                  return (
                    <div key={i} className="message-input">
                      <h2>
                        <span>{message.user}</span> says:
                      </h2>
                      <p>{message.messageBody}</p>
                      <h3>Time: {message.when}</h3>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>

            <form id="input-forms" onSubmit={handleSubmit}>
              <input
                id="username-input"
                type="text"
                name="user"
                placeholder="Username"
                onChange={handleChange}
              />
              <textarea
                id="message-input"
                name="messageBody"
                value={input.messageBody}
                placeholder="Type your message..."
                onChange={handleChange}
              ></textarea>
              <button id="submit-button" type="submit" value="Enter">
                Enter
              </button>
            </form>
          </div>

          <div id="market-space">
            <img src={images[currentImage]} alt="marketers" />
          </div>
        </div>
      </main>
    );
  }

  export default App;
