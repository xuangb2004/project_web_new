import { db } from "../db.js";

// Lấy danh sách tất cả các danh mục
export const getCategories = (req, res) => {
  const q = "SELECT id, name, description FROM Categories ORDER BY id ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json("Lỗi khi lấy danh sách danh mục");
    }
    return res.status(200).json(data);
  });
};

// Lấy chi tiết một danh mục theo ID
export const getCategory = (req, res) => {
  const categoryId = req.params.id;
  const q = "SELECT id, name, description FROM Categories WHERE id = ?";

  db.query(q, [categoryId], (err, data) => {
    if (err) {
      console.error("Error fetching category:", err);
      return res.status(500).json("Lỗi khi lấy danh mục");
    }
    if (data.length === 0) {
      return res.status(404).json("Không tìm thấy danh mục");
    }
    return res.status(200).json(data[0]);
  });
};

