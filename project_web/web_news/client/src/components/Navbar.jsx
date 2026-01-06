import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Dropdown from "./Dropdown"; 
import { FaCaretDown, FaSearch } from "react-icons/fa";
import axios from "../utils/axios"; 

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef();
  const searchRef = useRef();

  // Get current category from URL
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("cat");

  const handleSearch = (e) => {
    if ((e.type === "click" || e.key === "Enter") && query.trim() !== "") {
      setOpenDropdown(false);
      setShowSuggestions(false);
      navigate(`/?search=${query.trim()}`);
    }
  };

  const handleSuggestionClick = (suggestionQuery) => {
    setQuery(suggestionQuery);
    setShowSuggestions(false);
    navigate(`/?search=${suggestionQuery}`);
  };

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await axios.get(`/posts?search=${encodeURIComponent(query.trim())}&sortBy=time`);
        // Filter only approved articles and limit to 5 suggestions
        const approvedArticles = res.data
          .filter(article => article.status === 'approved')
          .slice(0, 5);
        setSuggestions(approvedArticles);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="navbar">
      <div className="container"> 
        <div className="logo">
          <Link to="/"><h2>MyNews</h2></Link>
        </div>
        
        <div className="links">
          <Link className={`link ${currentCategory === "Thời sự" ? "active" : ""}`} to="/?cat=Thời sự"><h6>THỜI SỰ</h6></Link>
          <Link className={`link ${currentCategory === "Thế giới" ? "active" : ""}`} to="/?cat=Thế giới"><h6>THẾ GIỚI</h6></Link>
          <Link className={`link ${currentCategory === "Kinh doanh" ? "active" : ""}`} to="/?cat=Kinh doanh"><h6>KINH DOANH</h6></Link>
          <Link className={`link ${currentCategory === "Công nghệ" ? "active" : ""}`} to="/?cat=Công nghệ"><h6>CÔNG NGHỆ</h6></Link>
          <Link className={`link ${currentCategory === "Thể thao" ? "active" : ""}`} to="/?cat=Thể thao"><h6>THỂ THAO</h6></Link>
          <Link className={`link ${currentCategory === "Giải trí" ? "active" : ""}`} to="/?cat=Giải trí"><h6>GIẢI TRÍ</h6></Link>
          
          {/* --- THANH TÌM KIẾM (Vị trí mới: Sát User Profile) --- */}
          <div className="search-bar" ref={searchRef}>
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
            />
            {isSearching && (
              <span style={{ position: "absolute", right: "35px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: "#999" }}>
                Đang tìm...
              </span>
            )}
            <span className="search-icon" onClick={handleSearch}>
              <FaSearch />
            </span>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((post) => (
                  <div
                    key={post.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(post.title)}
                  >
                    {post.thumbnail && (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="suggestion-thumbnail"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="suggestion-content">
                      <div className="suggestion-title">{post.title}</div>
                      {post.cat_name && (
                        <div className="suggestion-category">{post.cat_name}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showSuggestions && query.trim().length >= 2 && !isSearching && suggestions.length === 0 && (
              <div className="search-suggestions">
                <div className="suggestion-item" style={{ cursor: "default", color: "#999" }}>
                  Không tìm thấy kết quả
                </div>
              </div>
            )}
          </div>
          {/* -------------------------------------------------- */}

          {/* Phần User Profile */}
          {currentUser ? (
            <div className="user-menu-container" ref={menuRef}>
              <div 
                className="user-trigger" 
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <img 
                  src={currentUser.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt="" 
                  className="nav-avatar" 
                />
                <span className="username">{currentUser.username}</span>
                <FaCaretDown className="icon-down" />
              </div>
              {openDropdown && <Dropdown user={currentUser} logout={logout} />}
            </div>
          ) : (
            <Link className="login-link" to="/login">Đăng nhập</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;