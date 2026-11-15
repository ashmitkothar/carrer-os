
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./Jobs.css";

const SKILL_CATALOG = [
    "Spring Boot", "JavaScript", "Java", "Python", "MySQL",
    "React", "SQL", "OOPs", "DBMS", "REST API", "REST APIs",
    "Git", "Excel", "Communication", "CSS", "HTML",
    "Hibernate", "Microservices", "Docker", "AWS", "Kafka",
    "MongoDB", "Power BI", "Tableau", "DSA", "Manual Testing",
    "Selenium", "Networking", "Troubleshooting"
];

const normalize = value =>
    String(value || "").trim().toLowerCase();

const parseSkills = value => {
    if (Array.isArray(value)) {
        return value.map(normalize).filter(Boolean);
    }

    return String(value || "")
        .split(/[,;\n|]+/)
        .map(normalize)
        .filter(Boolean);
};

function cleanSnippet(value) {
    return String(value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function getCategory(title, snippet) {
    const text = `${title} ${snippet}`.toLowerCase();

    const nonCodingTerms = [
        "business analyst", "data analyst", "it support",
        "technical support", "customer support",
        "operations analyst", "hr executive", "recruiter"
    ];

    if (nonCodingTerms.some(term => text.includes(term))) {
        return "Non-Coding";
    }

    const codingTerms = [
        "developer", "software engineer", "programmer",
        "frontend", "backend", "full stack", "java",
        "devops", "qa tester", "automation tester",
        "data engineer"
    ];

    if (codingTerms.some(term => text.includes(term))) {
        return "Coding";
    }

    return "Other";
}

// Experience classification based on available listing text
function getExperienceLabel(title, snippet) {
    const text = `${title} ${snippet}`.toLowerCase();

    if (/\b(senior|lead|principal|architect)\b/.test(text)) {
        return "Experienced role";
    }

    const range = text.match(
        /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i
    );

    if (range) {
        const minimum = Number(range[1]);
        const maximum = Number(range[2]);

        if (minimum >= 2 || maximum >= 3) {
            return "Experienced role";
        }

        if (maximum <= 2) {
            return "Possible entry-level role";
        }
    }

    const plus = text.match(
        /(\d+(?:\.\d+)?)\s*\+\s*(?:years?|yrs?)/i
    );

    if (plus) {
        return Number(plus[1]) >= 2
            ? "Experienced role"
            : "Possible entry-level role";
    }

    const single = text.match(
        /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s+)?(?:relevant\s+)?experience/i
    );

    if (single) {
        return Number(single[1]) >= 2
            ? "Experienced role"
            : "Possible entry-level role";
    }

    if (/\b(fresher|entry.level|graduate|intern|trainee|junior)\b/.test(text)) {
        return "Possible entry-level role";
    }

    return "Experience not specified";
}

function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function Jobs({ user }) {
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState("");

    const [searchInput, setSearchInput] = useState("Java Developer");
    const [searchTerm, setSearchTerm] = useState("Java Developer");
    const [locationInput, setLocationInput] = useState("India");
    const [location, setLocation] = useState("India");

    const [liveJobs, setLiveJobs] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobError, setJobError] = useState("");

    const [savedJobs, setSavedJobs] = useState([]);
    const [category, setCategory] = useState("All");
    const [savedOnly, setSavedOnly] = useState(false);
    const [experienceFilter, setExperienceFilter] = useState("All");

    const [aiResults, setAiResults] = useState({});
    const [aiErrors, setAiErrors] = useState({});
    const [aiLoadingJob, setAiLoadingJob] = useState(null);

    const userId = user?.id;

    // Load user profile
    useEffect(() => {
        let active = true;

        async function loadProfile() {
            if (!userId) {
                setProfileError("Please log in again.");
                setProfileLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8080/api/profile/${userId}`
                );

                if (!response.ok) {
                    throw new Error("Unable to load your profile.");
                }

                const data = await response.json();

                if (active) {
                    setProfile(data);

                    const initialQuery =
                        data.careerInterest?.trim() || "Java Developer";

                    setSearchInput(initialQuery);
                    setSearchTerm(initialQuery);
                    setProfileError("");
                }

            } catch (error) {
                if (active) setProfileError(error.message);
            } finally {
                if (active) setProfileLoading(false);
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, [userId]);

    // Load saved jobs
    useEffect(() => {
        if (!userId) return;

        try {
            const stored = localStorage.getItem(
                `careerOsSavedJobs_${userId}`
            );

            setSavedJobs(stored ? JSON.parse(stored) : []);
        } catch {
            setSavedJobs([]);
        }
    }, [userId]);

    // Fetch live jobs from Jooble
    useEffect(() => {
        if (!profile || !searchTerm.trim()) return;

        const controller = new AbortController();

        async function loadLiveJobs() {
            setJobsLoading(true);
            setJobError("");

            try {
                const params = new URLSearchParams({
                    keywords: searchTerm,
                    location,
                    page: String(page)
                });

                const response = await fetch(
                    `http://localhost:8080/api/jobs/live?${params.toString()}`,
                    { signal: controller.signal }
                );

                const responseText = await response.text();

                let data;

                try {
                    data = JSON.parse(responseText);
                } catch {
                    throw new Error("Invalid response from job server.");
                }

                if (!response.ok) {
                    throw new Error(data.error || "Unable to retrieve live jobs.");
                }

                if (!Array.isArray(data.jobs)) {
                    throw new Error("Unexpected Jooble response.");
                }

                setLiveJobs(data.jobs);
                setTotalCount(Number(data.totalCount) || 0);
                setAiResults({});
                setAiErrors({});

            } catch (error) {
                if (error.name !== "AbortError") {
                    setJobError(error.message);
                    setLiveJobs([]);
                    setTotalCount(0);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setJobsLoading(false);
                }
            }
        }

        loadLiveJobs();

        return () => controller.abort();

    }, [profile, searchTerm, location, page]);

    const userSkills = useMemo(
        () => [...new Set(parseSkills(profile?.skills))],
        [profile]
    );

    const interest = normalize(profile?.careerInterest);

    // Match live jobs against candidate profile
    const personalizedJobs = useMemo(() => {
        return liveJobs.map((raw, index) => {
            const title = raw.title || "Untitled Job";
            const snippet = cleanSnippet(raw.snippet);
            const company = raw.company || "Company not specified";

            const searchableText =
                `${title} ${snippet}`.toLowerCase();

            const listedSkills = SKILL_CATALOG.filter(skill =>
                searchableText.includes(skill.toLowerCase())
            );

            const matchedSkills = userSkills.filter(skill =>
                searchableText.includes(skill)
            );

            const missingSkills = listedSkills.filter(skill =>
                !userSkills.includes(skill.toLowerCase())
            );

            const roleMatch = Boolean(
                interest &&
                (title.toLowerCase().includes(interest) ||
                    interest.includes(title.toLowerCase()))
            );

            const matchScore = Math.min(
                100,
                Math.round(
                    (userSkills.length
                        ? matchedSkills.length / userSkills.length * 70
                        : 0) +
                    (roleMatch ? 30 : 0)
                )
            );

            const jobLink = String(raw.link || "");

            return {
                key: jobLink || `${title}-${company}-${index}`,
                title,
                company,
                location: raw.location || "Location not specified",
                salary: raw.salary || "Not disclosed",
                type: raw.type || "Not specified",
                source: raw.source || "Jooble",
                link: /^https?:\/\//i.test(jobLink) ? jobLink : "",
                snippet,
                updated: raw.updated || "",
                category: getCategory(title, snippet),
                listedSkills,
                matchedSkills,
                missingSkills,
                matchScore,
                experienceLabel: getExperienceLabel(title, snippet)
            };
        });
    }, [liveJobs, userSkills, interest]);

    // Search filters
    const filteredJobs = personalizedJobs.filter(job => {
        const matchesCategory =
            category === "All" || job.category === category;

        const matchesSaved =
            !savedOnly || savedJobs.includes(job.key);

        const matchesExperience =
            experienceFilter === "All" ||
            (experienceFilter === "Fresher" &&
                job.experienceLabel === "Possible entry-level role") ||
            (experienceFilter === "Experienced" &&
                job.experienceLabel === "Experienced role") ||
            (experienceFilter === "Not specified" &&
                job.experienceLabel === "Experience not specified");

        return matchesCategory && matchesSaved && matchesExperience;
    });

    // Save and unsave jobs
    const toggleSave = job => {
        setSavedJobs(previous => {
            const updated = previous.includes(job.key)
                ? previous.filter(key => key !== job.key)
                : [...previous, job.key];

            localStorage.setItem(
                `careerOsSavedJobs_${userId}`,
                JSON.stringify(updated)
            );

            return updated;
        });
    };

    // Gemini AI job analysis
    const analyzeJob = async job => {
        if (!userId || aiLoadingJob !== null) return;

        setAiLoadingJob(job.key);

        setAiErrors(previous => ({
            ...previous,
            [job.key]: ""
        }));

        try {
            const education = [
                profile?.highestEducation,
                profile?.college,
                profile?.graduationYear
            ].filter(Boolean).join(", ");

            const response = await fetch(
                "http://localhost:8080/api/jobs/explain",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        role: job.title,
                        company: job.company,
                        location: job.location,
                        category: job.category,
                        salary: job.salary,
                        requiredSkills: job.listedSkills.join(", "),
                        candidateSkills: userSkills.join(", "),
                        careerInterest: profile?.careerInterest || "",
                        education: education || "Not provided",
                        matchedSkills: job.matchedSkills.join(", "),
                        missingSkills: job.missingSkills.join(", "),
                        matchScore: `${job.matchScore}%`
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "AI analysis failed.");
            }

            setAiResults(previous => ({
                ...previous,
                [job.key]: data.explanation
            }));

        } catch (error) {
            setAiErrors(previous => ({
                ...previous,
                [job.key]: error.message
            }));
        } finally {
            setAiLoadingJob(null);
        }
    };

    const getMatchClass = score =>
        score >= 70 ? "high" : score >= 40 ? "medium" : "low";

    const handleSearch = e => {
        e.preventDefault();
        setSearchTerm(searchInput.trim() || "Java Developer");
        setLocation(locationInput.trim() || "India");
        setPage(1);
    };

    if (profileLoading) {
        return <div className="jobs-page">Loading your profile...</div>;
    }

    if (profileError) {
        return (
            <div className="jobs-page">
                <h1>Job Recommendations</h1>
                <p>{profileError}</p>
            </div>
        );
    }

    return (
        <div className="jobs-page">

            <div className="jobs-heading">
                <div>
                    <span className="jobs-eyebrow">
                        LIVE CAREER OPPORTUNITIES
                    </span>
                    <h1>Job Recommendations</h1>
                    <p>
                        Live job listings matched with your profile.
                    </p>
                </div>
                <div className="job-ai-icon">✦ AI</div>
            </div>

            <div className="job-live-notice">
                <strong>Live listings from Jooble</strong>
                <span>
                    Check each original posting for current availability and
                    eligibility before applying.
                </span>
            </div>

            <div className="job-match-summary">
                <div>
                    <span>Your profile skills</span>
                    <div className="job-profile-skills">
                        {userSkills.length > 0
                            ? userSkills.map(skill => (
                                <span key={skill}>{skill}</span>
                            ))
                            : "Add skills in My Profile."}
                    </div>
                </div>

                <div className="job-interest">
                    <span>Career Interest</span>
                    <strong>
                        {profile?.careerInterest || "Not specified"}
                    </strong>
                </div>
            </div>

            {/* Live Job Search */}
            <form className="live-job-search" onSubmit={handleSearch}>
                <div className="live-search-field">
                    <label>Job role or keywords</label>
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Java Developer, Data Analyst..."
                    />
                </div>

                <div className="live-search-field">
                    <label>Location</label>
                    <input
                        value={locationInput}
                        onChange={e => setLocationInput(e.target.value)}
                        placeholder="India, Indore, Pune..."
                    />
                </div>

                <button type="submit" disabled={jobsLoading}>
                    {jobsLoading ? "Searching..." : "Search Live Jobs →"}
                </button>
            </form>

            {/* Category filters */}
            <div className="job-filter-row">
                <div className="job-category-filters">
                    {["All", "Coding", "Non-Coding", "Other"].map(item => (
                        <button
                            key={item}
                            className={category === item ? "selected" : ""}
                            onClick={() => setCategory(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <button
                    className={`saved-filter ${savedOnly ? "selected" : ""}`}
                    onClick={() => setSavedOnly(!savedOnly)}
                >
                    {savedOnly ? "♥ Saved Jobs" : "♡ Show Saved Jobs"}
                </button>
            </div>

            {/* NEW: Experience filters */}
            <div className="experience-filter-row">
                <strong>Experience Level:</strong>

                <div className="experience-filter-buttons">
                    {["All", "Fresher", "Experienced", "Not specified"].map(item => (
                        <button
                            key={item}
                            type="button"
                            className={experienceFilter === item ? "selected" : ""}
                            onClick={() => setExperienceFilter(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="jobs-summary">
                <div>
                    <h3>{totalCount.toLocaleString("en-IN")}</h3>
                    <p>Jooble Search Results</p>
                </div>
                <div>
                    <h3>{filteredJobs.length}</h3>
                    <p>Jobs on This Page</p>
                </div>
                <div>
                    <h3>{savedJobs.length}</h3>
                    <p>Saved Jobs</p>
                </div>
            </div>

            {jobError && (
                <div className="job-live-error">{jobError}</div>
            )}

            {jobsLoading && (
                <div className="jobs-loading">
                    Fetching live jobs from Jooble...
                </div>
            )}

            {!jobsLoading && !jobError && (
                <div className="jobs-list">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map(job => (
                            <div className="job-card" key={job.key}>

                                <div className="job-card-top">
                                    <div className="company-icon">
                                        {job.company.charAt(0).toUpperCase()}
                                    </div>

                                    <span className={`job-match-badge ${getMatchClass(job.matchScore)}`}>
                                        {job.matchScore}% Match
                                    </span>

                                    <button
                                        type="button"
                                        className={`save-job ${savedJobs.includes(job.key) ? "saved" : ""}`}
                                        onClick={() => toggleSave(job)}
                                    >
                                        {savedJobs.includes(job.key) ? "♥ Saved" : "♡ Save"}
                                    </button>
                                </div>

                                <h2>{job.title}</h2>
                                <p className="job-company">{job.company}</p>

                                <div className="job-labels">
                                    <span>{job.category}</span>
                                    <span>{job.type}</span>
                                    <span>{job.experienceLabel}</span>
                                </div>

                                <div className="job-info">
                                    <span>📍 {job.location}</span>
                                    <span>💰 {job.salary}</span>
                                </div>

                                <div className="live-job-description">
                                    {job.snippet || "No description provided."}
                                </div>

                                <div className="job-match-progress">
                                    <div className="job-match-progress-heading">
                                        <span>Profile keyword match (estimate)</span>
                                        <strong>{job.matchScore}%</strong>
                                    </div>

                                    <div className="job-match-track">
                                        <div
                                            className={`job-match-fill ${getMatchClass(job.matchScore)}`}
                                            style={{ width: `${job.matchScore}%` }}
                                        />
                                    </div>
                                </div>

                                {job.listedSkills.length > 0 && (
                                    <div className="job-skills">
                                        {job.listedSkills.map(skill => (
                                            <span
                                                key={skill}
                                                className={userSkills.includes(skill.toLowerCase()) ? "matched" : "missing"}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="live-job-meta">
                                    <span>Source: {job.source}</span>
                                    <span>Updated: {formatDate(job.updated)}</span>
                                </div>

                                <button
                                    type="button"
                                    className="job-ai-button"
                                    onClick={() => analyzeJob(job)}
                                    disabled={aiLoadingJob !== null}
                                >
                                    {aiLoadingJob === job.key
                                        ? "Gemini is analyzing..."
                                        : "✦ AI Analyze Job"}
                                </button>

                                {aiErrors[job.key] && (
                                    <div className="job-ai-error">
                                        {aiErrors[job.key]}
                                    </div>
                                )}

                                {aiResults[job.key] && (
                                    <div className="job-ai-analysis">
                                        <div className="job-ai-analysis-heading">
                                            <span>✦ GEMINI AI INSIGHTS</span>
                                            <strong>Personalized Job Analysis</strong>
                                        </div>

                                        <div className="job-ai-analysis-content">
                                            <ReactMarkdown>
                                                {aiResults[job.key]}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {job.link ? (
                                    <a
                                        className="job-apply-button"
                                        href={job.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Job & Apply ↗
                                    </a>
                                ) : (
                                    <button
                                        className="job-apply-placeholder"
                                        disabled
                                    >
                                        Application Link Unavailable
                                    </button>
                                )}

                            </div>
                        ))
                    ) : (
                        <div className="no-jobs">
                            <h3>No matching jobs found</h3>
                            <p>
                                Try changing the filters or search location.
                            </p>

                            <button
                                onClick={() => {
                                    setCategory("All");
                                    setSavedOnly(false);
                                    setExperienceFilter("All");
                                    setSearchInput("Java Developer");
                                    setSearchTerm("Java Developer");
                                    setLocationInput("India");
                                    setLocation("India");
                                    setPage(1);
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!jobsLoading && totalCount > 20 && (
                <div className="live-job-pagination">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(previous => previous - 1)}
                    >
                        ← Previous
                    </button>

                    <span>Page {page}</span>

                    <button
                        onClick={() => setPage(previous => previous + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}

            <p className="live-job-disclaimer">
                Fresher and experience classifications are estimates based
                on listing text, not confirmed employer eligibility.
                Match scores are keyword-based estimates, not hiring scores.
                Always verify vacancy status and requirements at the original
                job posting.
            </p>

        </div>
    );
}

export default Jobs;
