import express from "express";

export default function docRoutes(db) {
  const router = express.Router();

  // Get all documents for the user
  router.get("/", async (req, res) => {
    try {
      const { id: userId } = req.user; // Assuming user is attached to req
      const { rows: documents } = await db.query(
        "SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get a single document
  router.get("/:id", async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: docId } = req.params;

      const { rows } = await db.query(
        "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
        [docId, userId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Create a new document
  router.post("/", async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { title, content } = req.body;
      const { rows } = await db.query(
        "INSERT INTO documents (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
        [userId, title, content]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Update a document
  router.put("/:id", async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: docId } = req.params;
      const { title, content } = req.body;

      const { rows } = await db.query(
        "UPDATE documents SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *",
        [title, content, docId, userId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Delete a document
  router.delete("/:id", async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: docId } = req.params;

      const { rowCount } = await db.query(
        "DELETE FROM documents WHERE id = $1 AND user_id = $2",
        [docId, userId]
      );

      if (!rowCount) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  return router;
}
