import { useState } from "react";

function ProfilePage({ session }) {
    const [profilePic, setProfilePic] = useState(session?.profilePic || null);
    const [username, setUsername] = useState("")
    const [company, setCompany] = useState("")
    const [role, setRole] = useState("")

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            let { width, height } = img;

            // ✅ Set your max size
            const maxSize = 300;

            // scale down if too large
            if (width > maxSize || height > maxSize) {
                const canvas = document.createElement("canvas");
                const scale = Math.min(maxSize / width, maxSize / height);

                canvas.width = width * scale;
                canvas.height = height * scale;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // get resized image as base64 (can also use blob if you prefer)
                const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
                setProfilePic(resizedDataUrl);
            } else {
                // no resizing needed
                setProfilePic(img.src);
            }
        };

        img.onerror = () => {
            alert("Invalid image file");
        };
    };


    // needs to check everything in state and add it here
    const handleSave = () => {

        try {
            fetch("http://localhost:5000/api/profile/update", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({profilePic, username, company, role}),
            }).then((res) => res.json())
                .then((data) => {
                    const { profilePic, username, company, role } = data.profile[0]; // adjust if your backend wraps it differently
                    setProfilePic(profilePic);
                    setUsername(username);
                    setCompany(company);
                    setRole(role);
                })
        } catch (error) {
            alert(error);
            throw error;

        }
        alert("Profile updated!");
    };

    return (
        <div className="container mt-5">
            <h2>My Profile</h2>

            {/* Profile Picture */}
            <div className="mb-3">
                {profilePic ? (
                    <img
                        src={profilePic}
                        alt="Profile"
                        className="rounded-circle"
                        width="120"
                        height="120"
                    />
                ) : (
                    <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{ width: "120px", height: "120px", border: "1px solid #ccc" }}
                    >
                        No Image
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control mt-2"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" />
            </div>

            <div className="mb-3">
                <label className="form-label">company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} type="text" />
            </div>

            <div className="mb-3">
                <label className="form-label">role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} type="text" />
            </div>




            {/* Email (read-only) */}
            <div className="mb-3">
                <label className="form-label">Email</label>
                <p>{session?.data.user.email || ""}</p>
            </div>

            <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
            </button>
        </div>
    );
}

export default ProfilePage;
