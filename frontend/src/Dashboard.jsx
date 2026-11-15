
import { useState } from "react";
import "./Dashboard.css";

import Profile from "./Profile";
import Jobs from "./Jobs";
import Tracker from "./Tracker";
import Assistant from "./Assistant";
import Resume from "./Resume";
import ResumeUpload from "./ResumeUpload";
import DashboardAnalytics from "./DashboardAnalytics";

function Dashboard({ user, onLogout }) {
    const name = user?.name || "User";
    const firstName = name.split(" ")[0];

    const [activePage, setActivePage] = useState("Overview");

    const menuItems = [
        ["⌂", "Overview"],
        ["◎", "My Profile"],
        ["✧", "Job Recommendations"],
        ["▤", "Application Tracker"],
        ["▥", "Career Analytics"],
        ["📄", "Resume Builder"],
        ["⬆", "Resume Analyzer"],
        ["✦", "AI Career Assistant"],
    ];

    const openPage = (page) => {
        setActivePage(page);
    };

    return (
        <div className="dashboard">

            <aside className="sidebar">

                <div className="dashboard-brand">
                    <span className="brand-icon">C</span>
                    CAREER OS
                </div>

                <p className="sidebar-label">WORKSPACE</p>

                <nav className="sidebar-menu">
                    {menuItems.map(([icon, label]) => (
                        <button
                            key={label}
                            className={`menu-item ${
                                activePage === label ? "active" : ""
                            }`}
                            onClick={() => openPage(label)}
                        >
                            <span>{icon}</span>
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="user-avatar">
                        {name.charAt(0).toUpperCase()}
                    </div>

                    <div className="sidebar-user-info">
                        <strong>{name}</strong>
                        <p>Career OS Member</p>
                    </div>
                </div>

                <button
                    className="logout-button"
                    onClick={onLogout}
                    type="button"
                >
                    <span>↪</span>
                    Logout
                </button>

            </aside>

            <main className="dashboard-main">

                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-date">
                            YOUR CAREER WORKSPACE
                        </p>
                        <h2>{activePage}</h2>
                    </div>

                    <div className="header-user">
                        <span>Welcome back,</span>
                        <strong>{name}</strong>
                    </div>
                </header>

                {activePage === "My Profile" ? (
                    <Profile user={user} />

                ) : activePage === "Job Recommendations" ? (
                    <Jobs user={user} />

                ) : activePage === "Application Tracker" ? (
                    <Tracker user={user} />

                ) : activePage === "Career Analytics" ? (
                    <DashboardAnalytics user={user} />

                ) : activePage === "Resume Builder" ? (
                    <Resume user={user} />

                ) : activePage === "Resume Analyzer" ? (
                    <ResumeUpload user={user} />

                ) : activePage === "AI Career Assistant" ? (
                    <Assistant user={user} />

                ) : activePage === "Overview" ? (

                    <>
                        <section className="dashboard-welcome">
                            <div>
                                <span className="gold-label">
                                    YOUR CAREER JOURNEY STARTS HERE
                                </span>

                                <h1>Welcome back, {firstName}!</h1>

                                <p>
                                    Manage your career, discover opportunities
                                    and prepare for your next step.
                                </p>
                            </div>

                            <div className="welcome-mark">✦</div>
                        </section>

                        <section className="stats-grid">

                            <div className="stat-card">
                                <span>◎</span>
                                <h3>My Profile</h3>
                                <p>Manage your career information.</p>
                                <button onClick={() => openPage("My Profile")}>
                                    View Profile →
                                </button>
                            </div>

                            <div className="stat-card">
                                <span>✧</span>
                                <h3>Find Jobs</h3>
                                <p>Explore personalized job suggestions.</p>
                                <button onClick={() => openPage("Job Recommendations")}>
                                    Explore Jobs →
                                </button>
                            </div>

                            <div className="stat-card">
                                <span>▤</span>
                                <h3>Applications</h3>
                                <p>Keep track of your job applications.</p>
                                <button onClick={() => openPage("Application Tracker")}>
                                    Track Applications →
                                </button>
                            </div>

                            <div className="stat-card">
                                <span>▥</span>
                                <h3>Career Analytics</h3>
                                <p>View your career progress and statistics.</p>
                                <button onClick={() => openPage("Career Analytics")}>
                                    View Analytics →
                                </button>
                            </div>

                            <div className="stat-card">
                                <span>📄</span>
                                <h3>Resume Builder</h3>
                                <p>Create your professional resume.</p>
                                <button onClick={() => openPage("Resume Builder")}>
                                    Build Resume →
                                </button>
                            </div>

                        </section>

                        <section className="dashboard-lower">

                            <div className="dashboard-panel">
                                <div className="panel-heading">
                                    <h3>Getting Started</h3>
                                </div>

                                <div className="getting-started">
                                    <p>
                                        Make the most of your Career OS workspace.
                                    </p>

                                    <button onClick={() => openPage("My Profile")}>
                                        Complete Your Profile →
                                    </button>

                                    <button onClick={() => openPage("Job Recommendations")}>
                                        Explore Job Recommendations →
                                    </button>

                                    <button onClick={() => openPage("Application Tracker")}>
                                        Manage Applications →
                                    </button>

                                    <button onClick={() => openPage("Resume Builder")}>
                                        Create Your Resume →
                                    </button>

                                    <button onClick={() => openPage("Resume Analyzer")}>
                                        Analyze Existing Resume →
                                    </button>

                                    <button onClick={() => openPage("Career Analytics")}>
                                        View Career Analytics →
                                    </button>
                                </div>
                            </div>

                            <div className="dashboard-panel ai-panel">
                                <div className="ai-symbol">✦</div>

                                <h3>Meet Your AI Career Assistant</h3>

                                <p>
                                    Get guidance on resumes, interviews,
                                    programming, skills and career planning.
                                </p>

                                <button
                                    className="gold-button"
                                    onClick={() => openPage("AI Career Assistant")}
                                >
                                    Start Conversation →
                                </button>
                            </div>

                        </section>

                        <div className="dashboard-footer">
                            Career OS · Your personal career workspace
                        </div>
                    </>

                ) : (

                    <section className="dashboard-panel">
                        <h3>{activePage}</h3>
                        <p>This feature is coming soon.</p>

                        <button
                            className="gold-button"
                            onClick={() => openPage("Overview")}
                        >
                            ← Back to Overview
                        </button>
                    </section>

                )}

            </main>
        </div>
    );
}

export default Dashboard;
