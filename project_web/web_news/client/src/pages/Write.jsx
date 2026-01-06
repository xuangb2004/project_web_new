import React, { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "../utils/axios";
import "../style_editor.scss";

// Block component types
const BlockTypes = {
  HEADER: "header",
  PARAGRAPH: "paragraph",
  IMAGE: "image",
  GALLERY: "gallery",
  ARTICLE_REFERENCE: "article_reference",
};

const HeaderBlock = ({ block, onUpdate, onDelete }) => {
  const [level, setLevel] = useState(block.data.level || 1);
  const h1Ref = useRef(null);
  const h2Ref = useRef(null);
  const h3Ref = useRef(null);
  const isFocusedRef = useRef(false);
  const headerRef = level === 1 ? h1Ref : level === 2 ? h2Ref : h3Ref;

  // Initialize and sync contentEditable with block data
  useEffect(() => {
    const currentRef = level === 1 ? h1Ref : level === 2 ? h2Ref : h3Ref;
    if (currentRef.current && !isFocusedRef.current) {
      const currentText = currentRef.current.textContent || "";
      const blockText = block.data.text || "";
      // Only update if the block data changed externally and element is not focused
      if (currentText !== blockText) {
        currentRef.current.textContent = blockText || "";
      }
    }
  }, [block.id, level, block.data.text]); // Include block.data.text but check focus state

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (headerRef.current) {
      const text = headerRef.current.textContent || "";
      onUpdate({ ...block, data: { text, level } });
    }
  };

  const placeholder = level === 1 ? "Nhập tiêu đề..." : level === 2 ? "Nhập tiêu đề phụ..." : "Nhập tiêu đề nhỏ...";
  const commonProps = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'data-placeholder': placeholder,
    style: { 
      minHeight: "2em", 
      outline: "none", 
      padding: "10px", 
      border: "1px solid #ddd", 
      borderRadius: "4px"
    }
  };

  return (
    <div className="block-item header-block">
      <div className="block-controls" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "8px" }}>
        <select 
          value={level} 
          onChange={(e) => {
            const newLevel = parseInt(e.target.value);
            // Save current text before changing level
            const currentText = headerRef.current?.textContent || "";
            setLevel(newLevel);
            // Update with new level
            setTimeout(() => {
              const newRef = newLevel === 1 ? h1Ref : newLevel === 2 ? h2Ref : h3Ref;
              if (newRef.current && currentText) {
                newRef.current.textContent = currentText;
              }
              onUpdate({ ...block, data: { text: currentText, level: newLevel } });
            }, 0);
          }}
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      {level === 1 && <h1 ref={h1Ref} {...commonProps} />}
      {level === 2 && <h2 ref={h2Ref} {...commonProps} />}
      {level === 3 && <h3 ref={h3Ref} {...commonProps} />}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #999;
        }
      `}</style>
    </div>
  );
};
const ParagraphBlock = ({ block, onUpdate, onDelete }) => {
  const paraRef = useRef(null);
  const isFocusedRef = useRef(false);

  // Initialize and sync contentEditable with block data
  useEffect(() => {
    if (paraRef.current && !isFocusedRef.current) {
      const currentHtml = paraRef.current.innerHTML || "";
      const blockHtml = block.data.html || block.data.text || "";
      // Only update if the block data changed externally and element is not focused
      if (currentHtml !== blockHtml) {
        paraRef.current.innerHTML = blockHtml || "";
      }
    }
  }, [block.id, block.data.html, block.data.text]); // Include block.data.html but check focus state

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (paraRef.current) {
      const html = paraRef.current.innerHTML || "";
      const text = paraRef.current.textContent || "";
      onUpdate({ ...block, data: { text, html } });
    }
  };

  return (
    <div className="block-item paragraph-block">
      <div className="block-controls">
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      <p
        ref={paraRef}
        contentEditable
        suppressContentEditableWarning
        className="paragraph-content"
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-placeholder="Nhập đoạn văn..."
      />
    </div>
  );
};
const ImageBlock = ({ block, onUpdate, onDelete }) => {
  const [url, setUrl] = useState(block.data.url || "");
  const [alt, setAlt] = useState(block.data.alt || "");

  const handleBlur = () => {
    onUpdate({ ...block, data: { url, alt } });
  };

  return (
    <div className="block-item image-block">
      <div className="block-controls" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
        <input
          type="text"
          placeholder="URL ảnh (https://example.com/image.jpg)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleBlur}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Mô tả ảnh (alt text)"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={handleBlur}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        {url && (
          <img
            src={url}
            alt={alt}
            style={{ width: "100%", maxWidth: "600px", height: "auto", borderRadius: "4px", marginTop: "10px" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
};

const GalleryBlock = ({ block, onUpdate, onDelete }) => {
  const [images, setImages] = useState(block.data.images || [{ url: "", alt: "" }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(block.data.autoPlay !== false); // Default to true
  const [intervalTime, setIntervalTime] = useState(block.data.interval || 3000); // Default 3 seconds
  const intervalRef = useRef(null);

  // Auto-advance functionality
  useEffect(() => {
    if (autoPlay && images.length > 1 && images.some(img => img.url)) {
      const advanceSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      };
      
      intervalRef.current = setInterval(advanceSlide, intervalTime);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoPlay, images, intervalTime]);

  const handleAddImage = () => {
    const newImages = [...images, { url: "", alt: "" }];
    setImages(newImages);
    onUpdate({ ...block, data: { images: newImages, autoPlay, interval: intervalTime } });
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    if (newImages.length === 0) {
      newImages.push({ url: "", alt: "" });
    }
    setImages(newImages);
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(0, newImages.length - 1));
    }
    onUpdate({ ...block, data: { images: newImages, autoPlay, interval: intervalTime } });
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...images];
    newImages[index][field] = value;
    setImages(newImages);
    onUpdate({ ...block, data: { images: newImages, autoPlay, interval: intervalTime } });
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    // Reset auto-play timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, intervalTime);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    // Reset auto-play timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, intervalTime);
    }
  };

  const handleAutoPlayChange = (e) => {
    const newAutoPlay = e.target.checked;
    setAutoPlay(newAutoPlay);
    onUpdate({ ...block, data: { images, autoPlay: newAutoPlay, interval: intervalTime } });
  };

  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value) || 3000;
    setIntervalTime(newInterval);
    onUpdate({ ...block, data: { images, autoPlay, interval: newInterval } });
  };

  const currentImage = images[currentIndex] || { url: "", alt: "" };
  const hasValidImages = images.some(img => img.url);

  return (
    <div className="block-item gallery-block">
      <div className="block-controls" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={handleAutoPlayChange}
            />
            <span>Tự động chuyển ảnh</span>
          </label>
          {autoPlay && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label>Khoảng thời gian (ms):</label>
              <input
                type="number"
                value={intervalTime}
                onChange={handleIntervalChange}
                min="1000"
                step="500"
                style={{ padding: "5px", width: "100px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
          )}
        </div>

        {/* Gallery Display */}
        {hasValidImages && (
          <div style={{ position: "relative", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" }}>
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              style={{ width: "100%", maxWidth: "800px", height: "auto", display: "block" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                  }}
                >
                  ›
                </button>
                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  fontSize: "12px"
                }}>
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Thumbnail Strip */}
        {hasValidImages && images.length > 1 && (
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            justifyContent: "center", 
            flexWrap: "wrap",
            marginBottom: "15px",
            padding: "15px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  // Reset auto-play timer when clicking thumbnail
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                  }
                  if (autoPlay) {
                    intervalRef.current = setInterval(() => {
                      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
                    }, intervalTime);
                  }
                }}
                style={{
                  width: "80px",
                  height: "80px",
                  border: "none",
                  borderRadius: "4px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  opacity: currentIndex === index ? 1 : 0.5,
                  backgroundColor: "#f5f5f5"
                }}
                onMouseEnter={(e) => {
                  if (currentIndex !== index) {
                    e.currentTarget.style.opacity = "0.7";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentIndex !== index) {
                    e.currentTarget.style.opacity = "0.5";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: "12px"
                  }}>
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {images.map((image, index) => (
            <div key={index} style={{ border: "1px solid #eee", padding: "10px", borderRadius: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "bold" }}>Ảnh {index + 1}</span>
                {images.length > 1 && (
                  <button
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Xóa
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="URL ảnh (https://example.com/image.jpg)"
                value={image.url}
                onChange={(e) => handleImageChange(index, "url", e.target.value)}
                onBlur={() => onUpdate({ ...block, data: { images, autoPlay, interval: intervalTime } })}
                style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Mô tả ảnh (alt text)"
                value={image.alt}
                onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                onBlur={() => onUpdate({ ...block, data: { images, autoPlay, interval: intervalTime } })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
          ))}
          <button
            onClick={handleAddImage}
            style={{
              padding: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            + Thêm ảnh
          </button>
        </div>
      </div>
    </div>
  );
};

const ArticleReferenceBlock = ({ block, onUpdate, onDelete }) => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState(block.data.article?.title || "");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(block.data.article || null);
  const dropdownRef = useRef(null);

  // Update search term when block data changes externally
  useEffect(() => {
    if (block.data.article?.title) {
      setSearchTerm(block.data.article.title);
      setSelectedArticle(block.data.article);
    } else {
      setSearchTerm("");
      setSelectedArticle(null);
    }
  }, [block.data.article]);

  // Fetch articles when searching
  useEffect(() => {
    const fetchArticles = async () => {
      if (searchTerm.trim().length < 2) {
        setArticles([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await axios.get(`/posts?search=${encodeURIComponent(searchTerm)}&sortBy=time`);
        // Filter only approved articles
        const approvedArticles = res.data.filter(article => article.status === 'approved');
        setArticles(approvedArticles);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setArticles([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchArticles, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setSearchTerm(article.title);
    setShowDropdown(false);
    onUpdate({
      ...block,
      data: {
        article: {
          id: article.id,
          title: article.title,
          thumbnail: article.thumbnail,
          cat_name: article.cat_name,
        },
      },
    });
  };

  const handleClear = () => {
    setSelectedArticle(null);
    setSearchTerm("");
    setArticles([]);
    onUpdate({
      ...block,
      data: { article: null },
    });
  };

  return (
    <div className="block-item article-reference-block">
      <div className="block-controls" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "8px" }}>
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fff" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Tìm kiếm bài viết:
          </label>
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <input
              type="text"
              placeholder="hãy nhập tên bài viết bạn muốn tham chiếu"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
                if (!selectedArticle) {
                  setSelectedArticle(null);
                }
              }}
              onFocus={() => {
                if (articles.length > 0) {
                  setShowDropdown(true);
                }
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
            />
            {isSearching && (
              <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}>
                <span style={{ fontSize: "12px", color: "#999" }}>Đang tìm...</span>
              </div>
            )}
            {showDropdown && articles.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginTop: "4px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1000,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                {articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleSelectArticle(article)}
                    style={{
                      padding: "12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                  >
                    {article.thumbnail && (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        style={{
                          width: "60px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {article.title}
                      </div>
                      {article.cat_name && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {article.cat_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && searchTerm.length >= 2 && !isSearching && articles.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginTop: "4px",
                  padding: "12px",
                  zIndex: 1000,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ color: "#999", fontSize: "14px" }}>Không tìm thấy bài viết nào</div>
              </div>
            )}
          </div>
        </div>

        {selectedArticle && (
          <div
            style={{
              border: "2px solid #4CAF50",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#f9fff9",
              marginTop: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#333" }}>
                Bài viết đã chọn:
              </h4>
              <button
                onClick={handleClear}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Xóa
              </button>
            </div>
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              {selectedArticle.thumbnail && (
                <img
                  src={selectedArticle.thumbnail}
                  alt={selectedArticle.title}
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "6px", color: "#333" }}>
                  {selectedArticle.title}
                </div>
                {selectedArticle.cat_name && (
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                    Danh mục: {selectedArticle.cat_name}
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "#999" }}>
                  ID: {selectedArticle.id}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Write = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state;
  const editId = searchParams.get("edit");
  const isEditMode = !!editId || !!state?.id;
  const postId = editId || state?.id;

  const { currentUser } = useContext(AuthContext);
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(state?.thumbnail || "");
  const [cat, setCat] = useState(state?.category_id?.toString() || "");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const contentRef = useRef(null);
  const buttonsRef = useRef(null);
  const titleInputRef = useRef(null);

  // Convert blocks array to HTML
  const blocksToHTML = (blocksArray) => {
    if (!blocksArray || blocksArray.length === 0) return "<p></p>";
    
    return blocksArray
      .map((block) => {
        switch (block.type) {
          case BlockTypes.HEADER: {
            const level = block.data.level || 1;
            const headerText = block.data.text || "";
            return `<h${level}>${headerText}</h${level}>`;
          }
          case BlockTypes.PARAGRAPH: {
            const paraHtml = block.data.html || block.data.text || "";
            return `<p>${paraHtml}</p>`;
          }
          case BlockTypes.IMAGE: {
            const imgUrl = block.data.url || "";
            const imgAlt = block.data.alt || "";
            return imgUrl ? `<img src="${imgUrl}" alt="${imgAlt}" style="max-width: 100%; height: auto;" />` : "";
          }
          case BlockTypes.GALLERY: {
            const images = block.data.images || [];
            const autoPlay = block.data.autoPlay !== false;
            const interval = block.data.interval || 3000;
            const validImages = images.filter(img => img.url);
            if (validImages.length === 0) return "";
            
            // Create a gallery with data attributes for JavaScript to handle
            const imagesHTML = validImages.map(img => 
              `<img src="${img.url}" alt="${img.alt || ''}" data-gallery-image />`
            ).join("");
            return `<div class="gallery-container" data-autoplay="${autoPlay}" data-interval="${interval}">${imagesHTML}</div>`;
          }
          case BlockTypes.ARTICLE_REFERENCE: {
            const article = block.data.article;
            if (!article || !article.id) return "";
            
            const articleId = article.id;
            const articleTitle = article.title || "";
            const articleThumbnail = article.thumbnail || "";
            const articleCategory = article.cat_name || "";
            
            return `<div class="article-reference-container" data-article-id="${articleId}">
              <a href="/post/${articleId}" class="article-reference-link" style="display: flex; gap: 15px; padding: 15px; border: 2px solid #4CAF50; border-radius: 8px; text-decoration: none; color: inherit; background-color: #f9fff9; transition: all 0.2s;">
                ${articleThumbnail ? `<img src="${articleThumbnail}" alt="${articleTitle}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px;" />` : ""}
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #333;">${articleTitle}</h4>
                  ${articleCategory ? `<div style="font-size: 13px; color: #666; margin-bottom: 4px;">Danh mục: ${articleCategory}</div>` : ""}
                  <div style="font-size: 12px; color: #999;">Xem bài viết →</div>
                </div>
              </a>
            </div>`;
          }
          default:
            return "";
        }
      })
      .filter((html) => html)
      .join("");
  };

  // Parse HTML to blocks array
  const htmlToBlocks = (html) => {
    if (!html || html.trim() === "" || html.trim() === "<p><br></p>") {
      return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const blocks = [];
    let blockId = 1;

    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
          const level = parseInt(tagName.charAt(1));
          blocks.push({
            id: blockId++,
            type: BlockTypes.HEADER,
            data: {
              text: node.textContent || "",
              level: level,
            },
          });
        } else if (tagName === "p") {
          const html = node.innerHTML || "";
          const text = node.textContent || "";
          if (text.trim() !== "") {
            blocks.push({
              id: blockId++,
              type: BlockTypes.PARAGRAPH,
              data: {
                text: text,
                html: html,
              },
            });
          }
        } else if (tagName === "img") {
          // Check if it's part of a gallery
          const parent = node.parentElement;
          if (parent && parent.classList.contains("gallery-container")) {
            // Skip individual images in gallery, will be handled by gallery-container
            return;
          }
          blocks.push({
            id: blockId++,
            type: BlockTypes.IMAGE,
            data: {
              url: node.getAttribute("src") || "",
              alt: node.getAttribute("alt") || "",
            },
          });
        } else if (tagName === "div" && node.classList.contains("gallery-container")) {
          // Parse gallery
          const images = Array.from(node.querySelectorAll("img[data-gallery-image]")).map(img => ({
            url: img.getAttribute("src") || "",
            alt: img.getAttribute("alt") || "",
          }));
          const autoPlay = node.getAttribute("data-autoplay") !== "false";
          const interval = parseInt(node.getAttribute("data-interval")) || 3000;
          
          if (images.length > 0) {
            blocks.push({
              id: blockId++,
              type: BlockTypes.GALLERY,
              data: {
                images: images,
                autoPlay: autoPlay,
                interval: interval,
              },
            });
          }
        } else if (tagName === "div" && node.classList.contains("article-reference-container")) {
          // Parse article reference
          const articleId = node.getAttribute("data-article-id");
          const link = node.querySelector("a.article-reference-link");
          const img = link?.querySelector("img");
          const titleEl = link?.querySelector("h4");
          const categoryEl = link?.querySelector("div");
          
          if (articleId) {
            blocks.push({
              id: blockId++,
              type: BlockTypes.ARTICLE_REFERENCE,
              data: {
                article: {
                  id: parseInt(articleId),
                  title: titleEl?.textContent || "",
                  thumbnail: img?.getAttribute("src") || "",
                  cat_name: categoryEl?.textContent?.replace("Danh mục: ", "") || "",
                },
              },
            });
          }
        } else {
          // Process child nodes
          Array.from(node.childNodes).forEach(processNode);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          blocks.push({
            id: blockId++,
            type: BlockTypes.PARAGRAPH,
            data: {
              text: text,
            },
          });
        }
      }
    };

    // Process body children
    Array.from(doc.body.childNodes).forEach(processNode);

    return blocks.length > 0 ? blocks : [];
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axios.get("/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh sách danh mục.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // If in edit mode but no state data, fetch the post
  useEffect(() => {
    const fetchPost = async () => {
      if (isEditMode && postId && !state) {
        try {
          const res = await axios.get(`/posts/${postId}`);
          setTitle(res.data.title || "");
          const parsedBlocks = htmlToBlocks(res.data.content || "");
          setBlocks(parsedBlocks.length > 0 ? parsedBlocks : []);
          setFile(res.data.thumbnail || "");
          setCat(res.data.category_id?.toString() || "");
        } catch (err) {
          console.error("Error fetching post:", err);
          setError("Không thể tải bài viết để chỉnh sửa.");
        }
      } else if (state?.content) {
        const parsedBlocks = htmlToBlocks(state.content);
        setBlocks(parsedBlocks.length > 0 ? parsedBlocks : []);
      }
    };
    fetchPost();
  }, [isEditMode, postId, state]);

  // Position sidebar buttons
  useEffect(() => {
    const updateButtonPosition = () => {
      if (contentRef.current && buttonsRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect();
        const navbarHeight = 60;
        
        // Get footer to calculate bottom constraint
        const footer = document.querySelector('footer');
        let bottomValue = '20px'; // Default bottom padding
        
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // If footer is visible in viewport, calculate distance from bottom
          if (footerRect.top < viewportHeight) {
            // Footer is visible, set bottom to distance from viewport bottom to footer top + padding
            bottomValue = `${viewportHeight - footerRect.top + 20}px`;
          } else {
            // Footer is below viewport, use default or estimate footer height (~250px)
            bottomValue = '270px'; // Footer height estimate + padding
          }
        }
        
        // Position sidebar on the left side of content area, aligned with content start
        buttonsRef.current.style.left = `${Math.max(20, contentRect.left - 90)}px`; // 90px = 70px width + 20px gap
        buttonsRef.current.style.top = `${navbarHeight + 20}px`;
        buttonsRef.current.style.bottom = bottomValue;
        buttonsRef.current.style.height = 'auto'; // Let bottom constraint handle height
      }
    };

    updateButtonPosition();
    window.addEventListener('resize', updateButtonPosition);
    window.addEventListener('scroll', updateButtonPosition);

    return () => {
      window.removeEventListener('resize', updateButtonPosition);
      window.removeEventListener('scroll', updateButtonPosition);
    };
  }, []);

  // Block management functions
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type: type,
      data: type === BlockTypes.HEADER 
        ? { text: "", level: 1 }
        : type === BlockTypes.IMAGE
        ? { url: "", alt: "" }
        : type === BlockTypes.GALLERY
        ? { images: [{ url: "", alt: "" }], autoPlay: true, interval: 3000 }
        : type === BlockTypes.ARTICLE_REFERENCE
        ? { article: null }
        : { text: "", html: "" },
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (updatedBlock) => {
    setBlocks(blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)));
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const moveBlock = (blockId, direction) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!currentUser) {
      setError("Bạn cần đăng nhập để đăng bài!");
      return;
    }

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    if (!blocks || blocks.length === 0) {
      setError("Vui lòng thêm ít nhất một thành phần nội dung!");
      return;
    }

    if (!cat) {
      setError("Vui lòng chọn danh mục!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert blocks to HTML
      const htmlContent = blocksToHTML(blocks);
      
      // Log the data being sent for debugging
      const postData = {
        title: title.trim(),
        content: htmlContent,
        thumbnail: file || null,
        category_id: cat ? parseInt(cat) : null,
        user_id: currentUser.id,
      };
      
      console.log("=== FRONTEND: Sending post data ===");
      console.log("Post data:", postData);
      console.log("Current user:", currentUser);
      console.log("Is edit mode:", isEditMode);
      console.log("Post ID:", postId);

      let response;
      if (isEditMode && postId) {
        // Update existing post
        console.log("Updating post:", postId);
        response = await axios.put(`/posts/${postId}`, postData);
        console.log("=== FRONTEND: Post updated successfully ===");
        console.log("Response:", response.data);
      } else {
        // Create new post
        console.log("Creating new post");
        response = await axios.post("/posts", postData);
        console.log("=== FRONTEND: Post created successfully ===");
        console.log("Response:", response.data);
      }

      // Success message
      setSuccess(true);
      
      // Clear form after a short delay (only if creating new post)
      if (!isEditMode) {
        setTimeout(() => {
          setTitle("");
          setBlocks([]);
          setFile("");
          setCat("");
          setSuccess(false);
        }, 3000);
      }
      
      // Navigate to editor dashboard or home
      // Disable this for now
      // if (currentUser.role_id === 2) {
      //   navigate("/editor");
      // } else {
      //   navigate("/");
      // }
    } catch (err) {
      console.error("=== FRONTEND: ERROR creating post ===");
      console.error("Full error object:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Error request:", err.request);
      console.error("Error config:", err.config);
      
      // Handle different error response formats
      let errorMessage = isEditMode 
        ? "Đã xảy ra lỗi khi cập nhật bài viết. Vui lòng thử lại!"
        : "Đã xảy ra lỗi khi tạo bài viết. Vui lòng thử lại!";
      
      if (err.response) {
        // Server responded with error status
        console.error("Server responded with status:", err.response.status);
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data) {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error("No response received from server");
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không!";
      } else if (err.message) {
        // Something else happened
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case BlockTypes.HEADER:
        return (
          <HeaderBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      case BlockTypes.PARAGRAPH:
        return (
          <ParagraphBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      case BlockTypes.IMAGE:
        return (
          <ImageBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      case BlockTypes.GALLERY:
        return (
          <GalleryBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      case BlockTypes.ARTICLE_REFERENCE:
        return (
          <ArticleReferenceBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="add">
      <div className="content" ref={contentRef}>
        <input
          ref={titleInputRef}
          type="text"
          placeholder="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "15px", fontSize: "24px", marginBottom: "20px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        
        <div className="add-block-buttons" ref={buttonsRef} style={{ 
          position: "fixed",
          zIndex: 999,
          display: "flex", 
          flexDirection: "column",
          gap: "10px", 
          backgroundColor: "#fff",
          padding: "15px 10px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          border: "1px solid #ddd",
          width: "70px",
          alignItems: "center",
          overflowY: "auto"
        }}>
          <button
            onClick={() => addBlock(BlockTypes.HEADER)}
            style={{
              padding: "12px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            title="Thêm Tiêu đề"
          >
            H
          </button>
          <button
            onClick={() => addBlock(BlockTypes.PARAGRAPH)}
            style={{
              padding: "12px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            title="Thêm Đoạn văn"
          >
            P
          </button>
          <button
            onClick={() => addBlock(BlockTypes.IMAGE)}
            style={{
              padding: "12px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            title="Thêm Ảnh"
          >
            🖼️
          </button>
          <button
            onClick={() => addBlock(BlockTypes.GALLERY)}
            style={{
              padding: "12px",
              backgroundColor: "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            title="Thêm Gallery"
          >
            🖼️🖼️
          </button>
          <button
            onClick={() => addBlock(BlockTypes.ARTICLE_REFERENCE)}
            style={{
              padding: "12px",
              backgroundColor: "#E91E63",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            title="Thêm Tham chiếu Bài viết"
          >
            🔗
          </button>
        </div>
        
        <div className="block-editor" style={{ minHeight: "400px", padding: "20px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>

          {blocks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <p>Chưa có nội dung nào. Hãy thêm các thành phần bằng các nút phía trên.</p>
            </div>
          ) : (
            <div className="blocks-container" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {blocks.map((block, index) => (
                <div key={block.id} style={{ position: "relative" }}>
                  {renderBlock(block)}
                  {index > 0 && (
                    <button
                      onClick={() => moveBlock(block.id, "up")}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "35px",
                        padding: "6px 10px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "all 0.2s ease",
                        zIndex: 10,
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#45a049";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#4CAF50";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
                      }}
                    >
                      ↑
                    </button>
                  )}
                  {index < blocks.length - 1 && (
                    <button
                      onClick={() => moveBlock(block.id, "down")}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        padding: "6px 10px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "all 0.2s ease",
                        zIndex: 10,
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#0b7dda";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#2196F3";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
                      }}
                    >
                      ↓
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="menu">
        <div className="item">
          <h1>{isEditMode ? "Chỉnh sửa bài viết" : "Đăng bài"}</h1>
          <span>
            <b>Trạng thái: </b> {isEditMode ? "Chỉnh sửa" : "Tạo mới"}
          </span>
          <span>
            <b>Hiển thị: </b> {state?.status || (isEditMode ? "Đang chỉnh sửa" : "Pending")}
          </span>
          {isEditMode && postId && (
            <span>
              <b>ID bài viết: </b> {postId}
            </span>
          )}
          
          <div className="input-group">
            <label>Link Ảnh Thumbnail:</label>
            <input 
              type="text" 
              value={file} 
              onChange={(e) => setFile(e.target.value)} 
              placeholder="https://example.com/image.jpg"
            />
            {file && <img src={file} alt="Thumbnail preview" />}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ {isEditMode 
                ? "Bài viết đã được cập nhật thành công!" 
                : "Bài viết đã được tạo thành công với trạng thái 'pending'!"} 
              <br />
              <small>{isEditMode 
                ? "Các thay đổi đã được lưu." 
                : "Bạn có thể xem bài viết trên trang chủ."}</small>
            </div>
          )}

          <div className="buttons">
            <button onClick={handleClick} disabled={isSubmitting}>
              {isSubmitting 
                ? "Đang xử lý..." 
                : isEditMode 
                  ? "Cập nhật bài viết" 
                  : "Xuất bản"}
            </button>
          </div>
        </div>
        <div className="item">
          <h1>Danh mục</h1>
          {categoriesLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              Đang tải danh mục...
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              Không có danh mục nào
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="cat">
                <input
                  type="radio"
                  checked={cat == category.id}
                  name="cat"
                  value={category.id.toString()}
                  id={`cat-${category.id}`}
                  onChange={(e) => setCat(e.target.value)}
                />
                <label htmlFor={`cat-${category.id}`}>
                  <span style={{ fontWeight: "600" }}>{category.name}</span>
                  {category.description && (
                    <span style={{ display: "block", fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      {category.description}
                    </span>
                  )}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Write;