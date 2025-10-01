// server.js or routes file
const express = require("express");
const supabase = require("./SupabaseClient");
const { getSupabase } = require("./SupabaseClient");
const router = express.Router();

/* ---------------- USERS CRUD ---------------- */

// Create user
router.post("/users", async (req, res) => {
    const { username, email, password } = req.body;
    // Create user in auth.users
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username } // stores in user_metadata
        }
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user });

});




/*
TODO://  create route with usecase for grabbing a single user from db
router.get("/users/:id", async (req, res) => {
    const supabase = await getSupabase();
    const { id } = req.params;
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});
 */

router.post("/users/login", async (req, res) => {
    try {
        const supabase = await getSupabase();
        const {email, password} = req.body;
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });
            //grab profile for session

            const {data: profile, error: profileError} = await supabase
                .from("profile")
                .select("*")
                .eq("email", email)
            data.session.profile = profile;

            // grab controllers from session
            const {data: controllers, error: controllerError} = await supabase
                .from("trash_controllers")
                .select("*")
                .eq("email", email);


            res.json(data);
            // you now have a session token you can use for authenticated requests
    }catch (error) {
        return res.status(400).json({error: error.message});
    }
})


// Delete user
router.delete("/users/:id", async (req, res) => {
    const supabase = await getSupabase();
    const { id } = req.params;
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "User deleted" });
});


/* ---------------- TRASH CONTROLLERS CRUD ---------------- */

// Create controller

    router.post("/controllers/create", async (req, res) => {
        const { house_name, email } = req.body;

        try {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from("trash_controllers")
                .insert([{ house_name, email }])
                .select();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
});
    // get all controllers for user
router.post("/controllers", async (req, res) => {
    const { email } = req.body;
    try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from("trash_controllers")
            .select("*")
            .eq("email", email);  // filter controllers by user

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ controllers: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/profile/update", async (req, res) => {
    const { email, profilePic, username, company, role } = req.body;

    try {
        const supabase = await getSupabase();
        // update profile table based on email
        const { data, error } = await supabase
            .from("profile")
            .insert({
                email: email,
                picture: profilePic,
                username: username,
                company: company,
                role: role,
            })
            .select(); // return updated row

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res. json({ profile: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/profile/delete",  async (req, res) => {
    const { email } = req.body;
    try {
        const supabase = await getSupabase();
        const {data, error} = await supabase.from("profile").delete().eq("email", email);
        res.json({ message: "user profile deleted" });
    }catch(err) {
        console.log(err);
        res.status(500).json({error: "failed to delete user"})
    }


})


module.exports = router;
