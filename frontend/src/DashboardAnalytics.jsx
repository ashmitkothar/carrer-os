
import { useEffect, useState } from "react";
import "./DashboardAnalytics.css";

function DashboardAnalytics({ user }) {
    const [applications, setApplications] = useState([]);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = user?.id;

    useEffect(() => {
        let active = true;

        const loadAnalytics = async () => {
            if (!userId) {
                setError("Please log in again.");
                setLoading(false);
                return;
            }

            try {
                const [applicationsResponse, profileResponse] =
                    await Promise.all([
                        fetch(`http://localhost:8080/api/applications/${userId}`),
                        fetch(`http://localhost:8080/api/profile/${userId}`)
                    ]);

                if (!applicationsResponse.ok) {
                    throw new Error("Unable to load application statistics.");
                }

                const applicationsData = await applicationsResponse.json();

                let profileData = {};

                if (profileResponse.ok) {
                    profileData = await profileResponse.json();
                }

                if (active) {
                    setApplications(applicationsData);
                    setProfile(profileData);
                    setError("");
                }

            } catch (err) {
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadAnalytics();

        return () => {
            active = false;
        };
    }, [userId]);

    if (loading) {
        return (
            <div className="analytics-loading">
                Loading your career analytics...
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-error">
                {error}
            </div>
        );
    }

    const total = applications.length;

    const applied = applications.filter(
        app => app.status === "Applied"
    ).length;

    const interviews = applications.filter(
        app => app.status === "Interview"
    ).length;

    const selected = applications.filter(
        app => app.status === "Selected"
    ).length;

    const rejected = applications.filter(
        app => app.status === "Rejected"
    ).length;

    const profileFields = [
        "highestEducation",
        "college",
        "graduationYear",
        "skills",
        "experience",
        "careerInterest"
    ];

    const completedFields = profileFields.filter(field => {
        const value = profile[field];
        return value !== null &&
            value !== undefined &&
            String(value).trim() !== "";
    }).length;

    const profileCompletion = Math.round(
        (completedFields / profileFields.length) * 100
    );

    const statusData = [
        { name: "Applied", count: applied },
        { name: "Interview", count: interviews },
        { name: "Selected", count: selected },
        { name: "Rejected", count: rejected }
    ];

    const recentApplications = [...applications]
        .sort((a, b) =>
            String(b.appliedDate || "").localeCompare(
                String(a.appliedDate || "")
            )
        )
        .slice(0, 5);

    const getWidth = (count) => {
        if (total === 0) return "0%";
        return `${(count / total) * 100}%`;
    };

    return (
        <section className="analytics-section">

            <div className="analytics-heading">
                <div>
                    <span>YOUR PERFORMANCE</span>
                    <h2>Career Analytics</h2>
                    <p>Your career progress at a glance.</p>
                </div>
            </div>

            {/* Statistics Cards */}

            <div className="analytics-stats">

                <div className="analytics-card">
                    <span className="analytics-card-icon blue">▤</span>
                    <p>Total Applications</p>
                    <h2>{total}</h2>
                    <small>Applications tracked</small>
                </div>

                <div className="analytics-card">
                    <span className="analytics-card-icon teal">◎</span>
                    <p>Interviews</p>
                    <h2>{interviews}</h2>
                    <small>Interview opportunities</small>
                </div>

                <div className="analytics-card">
                    <span className="analytics-card-icon green">✓</span>
                    <p>Selected</p>
                    <h2>{selected}</h2>
                    <small>Successful applications</small>
                </div>

                <div className="analytics-card">
                    <span className="analytics-card-icon purple">✧</span>
                    <p>Profile Completion</p>
                    <h2>{profileCompletion}%</h2>
                    <small>Your profile progress</small>
                </div>

            </div>

            {/* Charts and Recent Activity */}

            <div className="analytics-bottom">

                <div className="analytics-panel">

                    <div className="analytics-panel-heading">
                        <h3>Application Overview</h3>
                        <span>{total} Total</span>
                    </div>

                    {total === 0 ? (
                        <div className="analytics-empty">
                            <span>▤</span>
                            <p>No applications tracked yet.</p>
                            <small>
                                Add applications in your Application Tracker
                                to see statistics here.
                            </small>
                        </div>
                    ) : (
                        <div className="status-chart">

                            {statusData.map(item => (
                                <div
                                    className="status-chart-row"
                                    key={item.name}
                                >
                                    <div className="status-chart-info">
                                        <span>{item.name}</span>
                                        <strong>{item.count}</strong>
                                    </div>

                                    <div className="status-chart-track">
                                        <div
                                            className={`status-chart-bar ${item.name.toLowerCase()}`}
                                            style={{
                                                width: getWidth(item.count)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </div>

                <div className="analytics-panel">

                    <div className="analytics-panel-heading">
                        <h3>Recent Activity</h3>
                        <span>Latest 5</span>
                    </div>

                    {recentApplications.length === 0 ? (
                        <div className="analytics-empty">
                            <span>◎</span>
                            <p>No recent activity.</p>
                            <small>
                                Your job application updates will appear here.
                            </small>
                        </div>
                    ) : (
                        <div className="recent-activity-list">
                            {recentApplications.map(app => (
                                <div
                                    className="recent-activity-item"
                                    key={app.id}
                                >
                                    <div className="activity-indicator">
                                        {app.companyName?.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="activity-details">
                                        <strong>{app.jobRole}</strong>
                                        <p>{app.companyName}</p>
                                        <small>{app.appliedDate || "Date unavailable"}</small>
                                    </div>

                                    <span className={`activity-status ${app.status.toLowerCase()}`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

            </div>

        </section>
    );
}

export default DashboardAnalytics;
