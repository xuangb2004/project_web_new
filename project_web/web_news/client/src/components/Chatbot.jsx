import React, { useState, useRef, useEffect } from "react";
import axios from "../utils/axios";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import "./Chatbot.scss";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi là trợ lý AI. Bạn muốn tìm tin tức về chủ đề gì?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("/chat", { message: userMessage });
      
      const botReply = res.data.reply;
      const posts = res.data.posts;

      setMessages(prev => [...prev, { text: botReply, isBot: true, posts: posts }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Xin lỗi, tôi đang gặp sự cố kết nối.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <FaRobot size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="title">
              <FaRobot /> Trợ lý tin tức AI
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.isBot ? "bot" : "user"}`}>
                <div className="bubble">{msg.text}</div>
                {msg.posts && msg.posts.length > 0 && (
                  <div className="recommended-posts">
                    {msg.posts.map(post => (
                      <a key={post.id} href={`/post/${post.id}`} className="post-link">
                        <img src={post.thumbnail} alt="" />
                        <span>{post.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="bubble typing">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập chủ đề bạn quan tâm..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSend} disabled={isLoading}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
