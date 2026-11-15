
import { useEffect, useState } from "react";
import "./Tracker.css";

function Tracker({ user }) {
    const [applications, setApplications] = useState([]);
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("Applied");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const userId = user?.id;

    const loadApplications = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/applications/${userId}`
            );

            if (!response.ok) {
                throw new Error("Could not load applications.");
            }

            const data = await response.json();
            setApplications(data);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) {
            setError("Please log in again to access your applications.");
            setLoading(false);
            return;
        }

        loadApplications();
    }, [userId]);

    const addApplication = async (e) => {
        e.preventDefault();

        if (!company.trim() || !role.trim()) return;

        setSaving(true);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/applications/${userId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        companyName: company,
                        jobRole: role,
                        status,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Unable to save application.");
            }

            const newApplication = await response.json();

            setApplications((previous) => [newApplication, ...previous]);
            setCompany("");
            setRole("");
            setStatus("Applied");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/applications/${userId}/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (!response.ok) {
                throw new Error("Could not update status.");
            }

            const updatedApplication = await response.json();

            setApplications((previous) =>
                previous.map((app) =>
                    app.id === id ? updatedApplication : app
                )
            );
            setError("");
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteApplication = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/applications/${userId}/${id}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Could not delete application.");
            }

            setApplications((previous) =>
                previous.filter((app) => app.id !== id)
            );
            setError("");
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="tracker-page">Loading applications...</div>;
    }

    return (
        <div className="tracker-page">
            <div className="jobs-heading">
                <div>
                    <span className="jobs-eyebrow">YOUR CAREER JOURNEY</span>
                    <h1>Application Tracker</h1>
                    <p>Keep track of every job application in one place.</p>
                </div>
            </div>

            {error && <p className="tracker-error">{error}</p>}

            <form className="tracker-form" onSubmit={addApplication}>
                <h2>Add New Application</h2>

                <input
                    type="text"
                    placeholder="Company name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Job role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Selected</option>
                    <option>Rejected</option>
                </select>

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "+ Add Application"}
                </button>
            </form>

            <div className="tracker-stats">
                <div>
                    <h2>{applications.length}</h2>
                    <p>Total Applications</p>
                </div>
                <div>
                    <h2>{applications.filter(a => a.status === "Applied").length}</h2>
                    <p>Applied</p>
                </div>
                <div>
                    <h2>{applications.filter(a => a.status === "Interview").length}</h2>
                    <p>Interviews</p>
                </div>
                <div>
                    <h2>{applications.filter(a => a.status === "Selected").length}</h2>
                    <p>Selected</p>
                </div>
            </div>

            <div className="tracker-list">
                <h2>Your Applications</h2>

                {applications.length === 0 ? (
                    <p>No applications added yet. Add your first application above!</p>
                ) : (
                    applications.map((app) => (
                        <div className="tracker-card" key={app.id}>
                            <div>
                                <h3>{app.jobRole}</h3>
                                <p>
                                    {app.companyName} · {app.appliedDate}
                                </p>
                            </div>

                            <select
                                value={app.status}
                                onChange={(e) => updateStatus(app.id, e.target.value)}
                            >
                                <option>Applied</option>
                                <option>Interview</option>
                                <option>Selected</option>
                                <option>Rejected</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => deleteApplication(app.id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Tracker;
