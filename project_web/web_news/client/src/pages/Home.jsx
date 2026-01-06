import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "../../utils/axios";
import moment from "moment";
import Trending from "../components/Trending";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const cat = useLocation().search;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = cat ? cat : "?sortBy=random";
        const res = await axios.get(`http://localhost:8800/api/posts${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  };

  if (posts.length === 0) return <div className="home"><p>Đang tải tin tức...</p></div>;

  return (
    <div className="home">
      <div className="news-layout">
        
        <div className="main-col">
          
          {posts[0] && (
            <div className="featured-post">
              <div className="img-container">
                 <Link to={`/post/${posts[0].id}`}>
                    <img src={posts[0].thumbnail} alt={posts[0].title} />
                 </Link>
              </div>
              <div className="info">
                <Link to={`/post/${posts[0].id}`} className="link">
                  <h1>{posts[0].title}</h1>
                </Link>
                <div className="meta">
                   <span className="source">MyNews</span> 
                   <span className="time">• {moment(posts[0].created_at).fromNow()} • {posts[0].view_count || 0} lượt xem</span>
                </div>
                <p>{getText(posts[0].content).substring(0, 150)}...</p>
              </div>
            </div>
          )}

          {/* 2. 3 TIN PHỤ NẰM NGANG (Bài 2, 3, 4) */}
          <div className="sub-news-row">
            {posts.slice(1,4).map((post, index) => (
              <div className="sub-post" key={post.id}>
                <div className="img-container">
                  <Link to={`/post/${post.id}`}>
                    <img src={post.thumbnail} alt="" />
                  </Link>
                </div>
                <Link to={`/post/${post.id}`} className="link">
                  <h3>{post.title}</h3>
                </Link>
                <span className="source">{post.cat_name || "Tin tức"}</span>
              </div>
            ))}
          </div>

        </div>

        {/* --- CỘT PHẢI (DANH SÁCH TIN) --- */}
        <div className="sidebar-col">
          {posts.slice( 4).map((post, index) => (
            <div className="sidebar-post" key={post.id}>
              <div className="info">
                <Link to={`/post/${post.id}`} className="link">
                   <h4>{post.title}</h4>
                </Link>
                <div className="meta">
                   <span className="source">{post.cat_name || "Tổng hợp"}</span> 
                   <span className="time">{moment(post.created_at).fromNow()} • {post.view_count || 0} lượt xem</span>
                </div>
              </div>
              <div className="img-container">
                 <img src={post.thumbnail} alt="" />
              </div>
            </div>
          ))}
        </div>

      </div>
      <Trending />
    </div>
  );
};

export default Home;