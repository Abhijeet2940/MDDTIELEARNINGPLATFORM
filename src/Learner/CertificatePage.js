import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession } from "../auth/session";
import { apiRequest } from "../api/client";

export default function CertificatePage() {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const printCertificate = () => {
    const originalTitle = document.title;
    const quizName = [...(assessment?.title || "Course quiz")]
      .filter((character) => character.charCodeAt(0) >= 32)
      .join("")
      .replace(/[<>:"/\\|?*]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    document.title = `${quizName || "Course quiz"}_certificate`;
    window.addEventListener(
      "afterprint",
      () => {
        document.title = originalTitle;
      },
      { once: true },
    );
    window.print();
  };

  useEffect(() => {
    let active = true;
    apiRequest(`/api/v1/assessments/${assessmentId}`)
      .then((details) => {
        if (!active) return;
        setAssessment(details);
        setCertificate(details.certificate);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [assessmentId]);

  return (
    <section className="portal-page portal-page--narrow">
      <div className="portal-page__heading">
        <div>
          <p className="portal-kicker">YOUR TRAINING RECORD</p>
          <h1>Certificate</h1>
        </div>
        <Link className="course-reader__back" to="/app/progress">
          Back to progress
        </Link>
      </div>
      {loading ? <p role="status">Loading certificate…</p> : null}
      {error ? (
        <p className="portal-message portal-message--error" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && !certificate ? (
        <p className="assessment-state">
          No certificate has been issued for this assessment.
        </p>
      ) : null}
      {certificate ? (
        <section
          className="portal-certificate portal-certificate-print portal-certificate--formal"
          aria-labelledby="certificate-title"
        >
          <header className="issued-certificate__institution">
            <p className="issued-certificate__name">EASTERN RAILWAY</p>
            <p className="issued-certificate__unit">MDDTI</p>
            <p className="issued-certificate__division">Beleghata, Sealdah Division</p>
            <span className="issued-certificate__rule" aria-hidden="true" />
          </header>

          <div className="issued-certificate__body">
            <p className="issued-certificate__eyebrow">TRAINING &amp; ASSESSMENT</p>
            <h2 id="certificate-title" className="issued-certificate__heading">
              CERTIFICATE OF COMPLETION
            </h2>
            <p className="issued-certificate__intro">This certificate is presented to</p>
            <p className="issued-certificate__recipient">
              {getSession()?.name || "Learner"}
            </p>
            <span className="issued-certificate__recipient-rule" aria-hidden="true" />
            <p className="issued-certificate__achievement">
              For successfully completing the <strong>{assessment?.title || "assessment"}</strong> and achieving
              an assessment score of <strong>{assessment?.latestPercentage ?? 0}%</strong>, demonstrating
              excellent understanding of the assessed material.
            </p>
          </div>

          <footer className="issued-certificate__footer">
            <div className="issued-certificate__signatory" aria-label="Blank authorized signatory area">
              <span className="issued-certificate__signature-line" aria-hidden="true" />
              <span>Authorized Signatory</span>
            </div>
            <div className="issued-certificate__location">
              MDDTI<br />Beleghata, Sealdah Division
            </div>
            <div className="issued-certificate__metadata">
              <p><span>Certificate ID</span>{certificate.certificateNumber}</p>
              <p>
                <span>Date of Issue</span>
                {new Date(certificate.issuedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </footer>

          <button
            className="portal-button portal-button--primary"
            type="button"
            onClick={printCertificate}
          >
            Print certificate
          </button>
        </section>
      ) : null}
    </section>
  );
}
