
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./Resume.css";

const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    github: "",
    professionalSummary: "",
    skills: "",
    education: "",
    experience: "",
    projects: "",
    certifications: ""
};

const fields = [
    { name: "fullName", label: "Full Name", placeholder: "Your full name", required: true },
    { name: "email", label: "Email Address", placeholder: "your@email.com", type: "email" },
    { name: "phone", label: "Phone Number", placeholder: "Your phone number" },
    { name: "location", label: "Location", placeholder: "City, State" },
    { name: "linkedIn", label: "LinkedIn Profile", placeholder: "LinkedIn URL" },
    { name: "github", label: "GitHub Profile", placeholder: "GitHub URL" },
    { name: "professionalSummary", label: "Professional Summary", placeholder: "Write your professional introduction...", textarea: true },
    { name: "skills", label: "Technical Skills", placeholder: "Java, Spring Boot, MySQL...", textarea: true },
    { name: "education", label: "Education", placeholder: "Degree, college, graduation year, CGPA...", textarea: true },
    { name: "experience", label: "Experience / Internship", placeholder: "Add your actual work or internship experience...", textarea: true },
    { name: "projects", label: "Projects", placeholder: "Project name, technologies and contributions...", textarea: true },
    { name: "certifications", label: "Certifications", placeholder: "List your certifications...", textarea: true }
];

function Resume({ user }) {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const userId = user?.id;

    useEffect(() => {
        const loadResume = async () => {
            if (!userId) {
                setError("Please log in again.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8080/api/resumes/${userId}`
                );

                if (response.status === 404) return;

                if (!response.ok) {
                    throw new Error("Unable to load resume.");
                }

                const data = await response.json();

                setForm({
                    ...initialForm,
                    ...data
                });

                setSaved(true);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadResume();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));

        setSaved(false);
        setAnalysis("");
        setSuccess("");
    };

    const saveResume = async (e) => {
        e.preventDefault();

        if (!userId) {
            setError("Please log in again.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/resumes/${userId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();

            setForm({
                ...initialForm,
                ...data
            });

            setSaved(true);
            setSuccess("Resume saved successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const analyzeResume = async () => {
        if (!saved) {
            setError("Please save your resume before analyzing.");
            return;
        }

        setAnalyzing(true);
        setError("");
        setAnalysis("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/resumes/${userId}/analyze`,
                { method: "POST" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed.");
            }

            setAnalysis(data.analysis);
        } catch (err) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const downloadPDF = () => {
        if (!form.fullName.trim()) {
            setError("Please enter your full name first.");
            return;
        }

        setError("");
        setShowPreview(true);

        // Allow the preview to render before opening print.
        requestAnimationFrame(() => {
            window.print();
        });
    };

    const showSection = (value) =>
        typeof value === "string" && value.trim().length > 0;

    if (loading) {
        return <div className="resume-page">Loading resume...</div>;
    }

    return (
        <div className="resume-page">
            <div className="resume-heading">
                <div>
                    <span className="resume-eyebrow">
                        PROFESSIONAL RESUME WORKSPACE
                    </span>
                    <h1>Resume Builder</h1>
                    <p>Create a clean, professional, ATS-friendly resume.</p>
                </div>
            </div>

            <div className="resume-template-info">
                <div>
                    <span className="template-label">SELECTED RESUME FORMAT</span>
                    <h2>Classic ATS</h2>
                    <p>Single-column · Professional · Black & White</p>
                </div>
                <span className="template-check">✓ Selected</span>
            </div>

            {error && (
                <div className="resume-message error">{error}</div>
            )}

            {success && (
                <div className="resume-message success">{success}</div>
            )}

            <form className="resume-form" onSubmit={saveResume}>
                <div className="resume-form-heading">
                    <h2>Resume Information</h2>
                    <p>Complete your professional details below.</p>
                </div>

                <div className="resume-fields">
                    {fields.map(field => (
                        <div
                            className={`resume-field ${field.textarea ? "full-width" : ""}`}
                            key={field.name}
                        >
                            <label htmlFor={field.name}>
                                {field.label}{field.required && " *"}
                            </label>

                            {field.textarea ? (
                                <textarea
                                    id={field.name}
                                    name={field.name}
                                    value={form[field.name] || ""}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    rows={4}
                                />
                            ) : (
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type || "text"}
                                    value={form[field.name] || ""}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    required={field.required || false}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="resume-save-area">
                    <p>Save your information before AI analysis.</p>

                    <div className="resume-actions">
                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Resume"}
                        </button>

                        <button
                            type="button"
                            className="resume-preview-btn"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            {showPreview ? "Hide Preview" : "Preview Resume"}
                        </button>

                        <button
                            type="button"
                            className="resume-analyze-btn"
                            onClick={analyzeResume}
                            disabled={!saved || analyzing}
                        >
                            {analyzing ? "Analyzing..." : "Analyze Resume"}
                        </button>

                        <button
                            type="button"
                            className="resume-download-btn"
                            onClick={downloadPDF}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>
            </form>

            {analyzing && (
                <div className="resume-analysis-loading">
                    Gemini AI is analyzing your resume...
                </div>
            )}

            {analysis && (
                <section className="resume-analysis">
                    <span>AI POWERED REVIEW</span>
                    <h2>Resume Analysis</h2>
                    <div className="analysis-content">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                </section>
            )}

            {showPreview && (
                <div className="resume-preview-label">
                    <h2>Resume Preview</h2>
                    <p>Your selected Classic ATS format.</p>
                </div>
            )}

            <div className={`resume-preview ${showPreview ? "preview-visible" : ""}`}>
                <header className="ats-header">
                    <h1>{form.fullName || "Your Name"}</h1>

                    <p>
                        {[form.location, form.phone, form.email]
                            .filter(Boolean).join(" | ")}
                    </p>

                    <p>
                        {[form.linkedIn, form.github]
                            .filter(Boolean).join(" | ")}
                    </p>
                </header>

                {showSection(form.professionalSummary) && (
                    <section>
                        <h2>PROFESSIONAL SUMMARY</h2>
                        <p>{form.professionalSummary}</p>
                    </section>
                )}

                {showSection(form.skills) && (
                    <section>
                        <h2>TECHNICAL SKILLS</h2>
                        <p>{form.skills}</p>
                    </section>
                )}

                {showSection(form.education) && (
                    <section>
                        <h2>EDUCATION</h2>
                        <p>{form.education}</p>
                    </section>
                )}

                {showSection(form.experience) && (
                    <section>
                        <h2>EXPERIENCE</h2>
                        <p>{form.experience}</p>
                    </section>
                )}

                {showSection(form.projects) && (
                    <section>
                        <h2>PROJECTS</h2>
                        <p>{form.projects}</p>
                    </section>
                )}

                {showSection(form.certifications) && (
                    <section>
                        <h2>CERTIFICATIONS</h2>
                        <p>{form.certifications}</p>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Resume;
