import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Link } from "react-router-dom";
import moment from "moment";
import { FaFire } from "react-icons/fa"; // Cài icon: npm install react-icons

const Trending = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/posts/trending");
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  if (posts.length === 0) return null; // Không có bài thì ẩn luôn

  return (
    <div className="trending-wrapper">
      <div className="trending-header">
        <h3><FaFire style={{color: "orange"}}/> Xu hướng tuần qua</h3>
        <div className="line"></div>
      </div>
      
      <div className="trending-grid">
        {posts.map((post) => (
          <div className="trending-card" key={post.id}>
            <div className="img-box">
               <Link to={`/post/${post.id}`}>
                 <img src={post.thumbnail} alt={post.title} />
               </Link>
               <span className="views-badge">{post.view_count} xem</span>
            </div>
            <div className="info">
               <span className="date">{moment(post.created_at).format("DD/MM")}</span>
               <Link to={`/post/${post.id}`} className="link">
                 <h4>{post.title}</h4>
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;