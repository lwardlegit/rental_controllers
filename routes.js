// server.js or routes file
const express = require("express");
const supabase = require("./SupabaseClient");

const router = express.Router();

/* ---------------- USERS CRUD ---------------- */

// Create user
router.post("/users", async (req, res) => {
    const { username, email } = req.body;
    const { data, error } = await supabase
        .from("users")
        .insert([{ username, email }])
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Get all users
router.get("/users", async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Get single user
router.get("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update user
router.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const { data, error } = await supabase
        .from("users")
        .update({ name, email })
        .eq("id", id)
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Delete user
router.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "User deleted" });
});


/* ---------------- TRASH CONTROLLERS CRUD ---------------- */

// Create controller
router.post("/controllers", async (req, res) => {
    const { name, location, user_id } = req.body;
    const { data, error } = await supabase
        .from("trash_controllers")
        .insert([{ name, location, user_id }])
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Get all controllers
router.get("/controllers", async (req, res) => {
    const { data, error } = await supabase.from("trash_controllers").select("*");

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Get controller by id
router.get("/controllers/:id", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("trash_controllers").select("*").eq("id", id).single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update controller
router.put("/controllers/:id", async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;
    const { data, error } = await supabase
        .from("trash_controllers")
        .update({ name, location })
        .eq("id", id)
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Delete controller
router.delete("/controllers/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("trash_controllers").delete().eq("id", id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Controller deleted" });
});

module.exports = router;
