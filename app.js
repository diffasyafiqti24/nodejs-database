const express = require("express");
const mysql = require("mysql2");
const { body, param, validationResult } = require("express-validator");

const app = express();
app.use(express.json());

// Koneksi database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "perpustakaan",
});

// Middleware untuk handling error validasi
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ================================
// ROUTE GET /buku
// ================================
app.get("/buku", (req, res) => {
  db.query("SELECT * FROM buku", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// ================================
// ROUTE GET /buku/:id
// ================================
app.get(
  "/buku/:id",
  param("id").isInt().withMessage("ID harus angka"),
  validate,
  (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM buku WHERE id = ?", [id], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Buku tidak ditemukan" });

      res.json(results[0]);
    });
  }
);

// ================================
// ROUTE POST /buku
// ================================
app.post(
  "/buku",
  [
    body("judul").notEmpty().withMessage("Judul wajib diisi"),
    body("penulis").notEmpty().withMessage("Penulis wajib diisi"),
    body("tahun").isInt({ min: 1000, max: 9999 }).withMessage("Tahun tidak valid"),
  ],
  validate,
  (req, res) => {
    const { judul, penulis, tahun } = req.body;

    db.query(
      "INSERT INTO buku (judul, penulis, tahun) VALUES (?, ?, ?)",
      [judul, penulis, tahun],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: "Buku berhasil ditambahkan", id: result.insertId });
      }
    );
  }
);

// ================================
// ROUTE PUT /buku/:id
// ================================
app.put(
  "/buku/:id",
  [
    param("id").isInt().withMessage("ID harus angka"),
    body("judul").optional().notEmpty().withMessage("Judul tidak boleh kosong"),
    body("penulis").optional().notEmpty().withMessage("Penulis tidak boleh kosong"),
    body("tahun")
      .optional()
      .isInt({ min: 1000, max: 9999 })
      .withMessage("Tahun tidak valid"),
  ],
  validate,
  (req, res) => {
    const { id } = req.params;
    const { judul, penulis, tahun } = req.body;

    db.query(
      "UPDATE buku SET judul=?, penulis=?, tahun=? WHERE id=?",
      [judul, penulis, tahun, id],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Buku tidak ditemukan" });

        res.json({ message: "Buku berhasil diperbarui" });
      }
    );
  }
);

// ================================
// ROUTE DELETE /buku/:id
// ================================
app.delete(
  "/buku/:id",
  param("id").isInt().withMessage("ID harus angka"),
  validate,
  (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM buku WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Buku tidak ditemukan" });

      res.json({ message: "Buku berhasil dihapus" });
    });
  }
);

app.listen(3000, () => {
  console.log("Server berjalan di port 3000");
});
