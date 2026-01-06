import { db } from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const chatWithAI = async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json("Message is required");

  // 1. Keyword extraction
  const stopWords = [
    "bài", "viết", "tin", "tức", "ảnh", "video", "clip", "bản",
    "vậy", "không", "có", "là", "của", "trong", "và", "những", "các", "với", "cho", "để", "khi", "đã", "đang", "sẽ", 
    "này", "đó", "kia", "cái", "việc", "chiếc", "người", "làm", "ra", "vào", "lên", "xuống", "đi", "đến", "tại", 
    "bởi", "vì", "nên", "nếu", "thì", "tuy", "nhưng", "hoặc", "hay", "rất", "quá", "lắm", "được", "bị", "phải", 
    "chưa", "chẳng", "đâu", "gì", "sao", "ai", "nào", "như", "thế", "muốn", "biết", "hỏi", "tôi", "bạn", "mình",
    "hãy", "giúp", "tìm", "kiếm", "xem", "đọc", "nghe", "thấy"
  ];

  const keywords = message.toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(w => w.length > 1 && !stopWords.includes(w));
  
  let posts = [];

  const searchPosts = () => {
    return new Promise((resolve, reject) => {
      if (keywords.length === 0) return resolve([]);

      const scoreParts = keywords.map(() => 
        "(CASE WHEN title LIKE ? THEN 2 ELSE 0 END + CASE WHEN content LIKE ? THEN 1 ELSE 0 END)"
      );
      const scoreQuery = scoreParts.join(" + ");
      
      const whereConditions = keywords.map(() => "title LIKE ? OR content LIKE ?");
      const whereQuery = whereConditions.join(" OR ");

      let params = [];
      keywords.forEach(w => { params.push(`%${w}%`); params.push(`%${w}%`); });
      keywords.forEach(w => { params.push(`%${w}%`); params.push(`%${w}%`); });

      const q = `
        SELECT id, title, thumbnail, created_at, LEFT(content, 200) as summary,
        (${scoreQuery}) as score
        FROM Posts 
        WHERE status = 'approved' AND (${whereQuery})
        HAVING score > 0
        ORDER BY score DESC, created_at DESC
        LIMIT 5
      `;

      db.query(q, params, (err, data) => {
        if (err) {
          console.error("AI Search Error:", err);
          resolve([]);
        } else {
          resolve(data);
        }
      });
    });
  };

  try {
    posts = await searchPosts();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      let reply = "";
      if (posts.length > 0) {
        reply = `(Offline) Tìm thấy ${posts.length} bài viết liên quan.`;
      } else {
        reply = `(Offline) Không tìm thấy bài viết nào.`;
      }
      return res.status(200).json({ reply, posts });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Bạn là trợ lý ảo của trang tin tức MyNews.
      Người dùng: "${message}"
      
      Dữ liệu bài viết tìm được:
      ${JSON.stringify(posts.map(p => ({ id: p.id, title: p.title, summary: p.summary })))}
      
      Hãy trả lời người dùng ngắn gọn, hữu ích (dưới 150 từ).
      Nếu có bài viết liên quan, hãy giới thiệu. Nếu không, hãy tự trả lời câu hỏi.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      reply: text,
      posts: posts
    });

  } catch (err) {
    console.error("Gemini Error:", err);
    
    let reply = "Xin lỗi, tôi đang gặp sự cố kết nối với AI.";

    if (err.status === 429) {
      reply = "Hệ thống AI đang quá tải. Dưới đây là các bài viết tìm được:";
    }

    return res.status(200).json({
      reply: reply,
      posts: posts
    });
  }
};
