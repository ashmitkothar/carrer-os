
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./ResumeUpload.css";

function ResumeUpload({ user }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [fileName, setFileName] = useState("");
    const [pageCount, setPageCount] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];

        setError("");
        setAnalysis("");
        setPageCount(null);
        setFileName("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (
            !selectedFile.name.toLowerCase().endsWith(".pdf") ||
            (selectedFile.type && selectedFile.type !== "application/pdf")
        ) {
            setError("Please select a valid PDF file.");
            setFile(null);
            e.target.value = "";
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("PDF size must be below 5 MB.");
            setFile(null);
            e.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const uploadAndAnalyze = async () => {
        if (!user?.id) {
            setError("Please log in again.");
            return;
        }

        if (!file) {
            setError("Please select your resume PDF first.");
            return;
        }

        setLoading(true);
        setError("");
        setAnalysis("");
        setFileName("");
        setPageCount(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `http://localhost:8080/api/resumes/${user.id}/upload/analyze`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to analyze your PDF."
                );
            }

            setAnalysis(data.analysis);
            setFileName(data.fileName);
            setPageCount(data.pageCount);

        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-upload-page">

            <div className="upload-heading">
                <div>
                    <span className="upload-eyebrow">
                        AI POWERED RESUME REVIEW
                    </span>

                    <h1>Resume Analyzer</h1>

                    <p>
                        Upload your existing resume and get personalized
                        feedback from Gemini AI.
                    </p>
                </div>

                <div className="upload-heading-icon">✦</div>
            </div>

            <div className="upload-card">

                <div className="upload-card-heading">
                    <h2>Upload Your Resume</h2>
                    <p>
                        Select an existing PDF resume from your computer.
                    </p>
                </div>

                <label className="pdf-drop-area" htmlFor="resume-pdf">

                    <div className="pdf-upload-icon">📄</div>

                    <h3>
                        {file ? file.name : "Choose your resume PDF"}
                    </h3>

                    <p>
                        {file
                            ? `${(file.size / 1024).toFixed(1)} KB · Ready to analyze`
                            : "Click here to browse files from your computer"}
                    </p>

                    <span className="pdf-browse-button">
                        Browse PDF
                    </span>

                    <input
                        id="resume-pdf"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        disabled={loading}
                    />

                </label>

                <div className="upload-guidelines">
                    <span>✓ PDF format only</span>
                    <span>✓ Maximum size 5 MB</span>
                    <span>✓ Maximum 10 pages</span>
                </div>

                {error && (
                    <div className="upload-error">
                        {error}
                    </div>
                )}

                <button
                    className="upload-analyze-button"
                    onClick={uploadAndAnalyze}
                    disabled={!file || loading}
                >
                    {loading
                        ? "Gemini AI is analyzing..."
                        : "✦ Analyze My Resume"}
                </button>

                <p className="upload-note">
                    Text is extracted from your PDF and sent to Gemini
                    for analysis. This upload is not saved by this
                    application. Scanned image-only PDFs are not supported yet.
                </p>

            </div>

            {loading && (
                <div className="upload-loading">
                    <div className="upload-spinner"></div>
                    <h3>Analyzing your resume...</h3>
                    <p>
                        Gemini AI is reviewing your skills, experience
                        and resume structure.
                    </p>
                </div>
            )}

            {analysis && (
                <section className="uploaded-analysis">

                    <div className="uploaded-analysis-heading">
                        <span>✦ AI ANALYSIS COMPLETED</span>
                        <h2>Your Resume Report</h2>
                        <p>
                            {fileName} · {pageCount} page(s)
                        </p>
                    </div>

                    <div className="uploaded-analysis-content">
                        <ReactMarkdown>
                            {analysis}
                        </ReactMarkdown>
                    </div>

                </section>
            )}

        </div>
    );
}

export default ResumeUpload;
