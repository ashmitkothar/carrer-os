
import { useEffect, useState } from "react";
import "./Profile.css";

function Profile({ user }) {
    const userId = user?.id;

    const [form, setForm] = useState({
        highestEducation: "",
        college: "",
        graduationYear: "",
        skills: "",
        experience: "",
        careerInterest: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) {
            setError("User information not found. Please login again.");
            setLoading(false);
            return;
        }

        fetch(`http://localhost:8080/api/profile/${userId}`)
            .then(async (response) => {
                if (response.ok) {
                    const data = await response.json();
                    setForm({
                        highestEducation: data.highestEducation || "",
                        college: data.college || "",
                        graduationYear: data.graduationYear || "",
                        skills: data.skills || "",
                        experience: data.experience || "",
                        careerInterest: data.careerInterest || "",
                    });
                } else if (response.status !== 404) {
                    throw new Error("Could not load your profile.");
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/profile/${userId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...form,
                        graduationYear: form.graduationYear
                            ? Number(form.graduationYear)
                            : null,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Profile save nahi hua. Please try again.");
            }

            setMessage("Your profile has been saved successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="profile-loading">Loading profile...</div>;

    return (
        <div className="profile-page">
            <div className="profile-heading">
                <div>
                    <span className="profile-eyebrow">YOUR CAREER DETAILS</span>
                    <h1>My Profile</h1>
                    <p>Tell us about yourself to get better career opportunities.</p>
                </div>
                <div className="profile-avatar">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-section-title">
                    <h2>Education details</h2>
                    <p>Your academic background</p>
                </div>

                <div className="profile-fields">
                    <label>
                        Highest Education
                        <select
                            name="highestEducation"
                            value={form.highestEducation}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select education</option>
                            <option value="B.Tech">B.Tech</option>
                            <option value="B.E.">B.E.</option>
                            <option value="BCA">BCA</option>
                            <option value="MCA">MCA</option>
                            <option value="M.Tech">M.Tech</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>

                    <label>
                        College / University
                        <input
                            name="college"
                            value={form.college}
                            onChange={handleChange}
                            placeholder="Enter your college name"
                            required
                        />
                    </label>

                    <label>
                        Graduation Year
                        <input
                            type="number"
                            name="graduationYear"
                            value={form.graduationYear}
                            onChange={handleChange}
                            placeholder="e.g. 2027"
                            min="2000"
                            max="2100"
                            required
                        />
                    </label>
                </div>

                <div className="profile-divider"></div>

                <div className="profile-section-title">
                    <h2>Skills & experience</h2>
                    <p>Help us understand your abilities</p>
                </div>

                <div className="profile-fields">
                    <label className="full-field">
                        Technical Skills
                        <textarea
                            name="skills"
                            value={form.skills}
                            onChange={handleChange}
                            placeholder="e.g. Java, Spring Boot, MySQL, HTML, CSS"
                            rows="3"
                        />
                    </label>

                    <label>
                        Experience
                        <select
                            name="experience"
                            value={form.experience}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select experience</option>
                            <option value="Fresher">Fresher</option>
                            <option value="Internship">Internship</option>
                            <option value="Less than 1 year">Less than 1 year</option>
                            <option value="1-2 years">1-2 years</option>
                            <option value="2+ years">2+ years</option>
                        </select>
                    </label>

                    <label>
                        Career Interest
                        <select
                            name="careerInterest"
                            value={form.careerInterest}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select career interest</option>
                            <option value="Java Developer">Java Developer</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="Software Developer">Software Developer</option>
                            <option value="Data Analyst">Data Analyst</option>
                            <option value="Business Analyst">Business Analyst</option>
                            <option value="AI/ML">AI / ML</option>
                            <option value="Other IT Roles">Other IT Roles</option>
                        </select>
                    </label>
                </div>

                {message && <div className="profile-success">{message}</div>}
                {error && <div className="profile-error">{error}</div>}

                <div className="profile-actions">
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Profile →"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Profile;
