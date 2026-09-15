import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Light_LOGO_SRC, Dark_LOGO_SRC, Light_PNG_SRC, Dark_PNG_SRC } from "../components/Shell";
import {
  resendVerificationCode,
  verifyEmail,
} from "../services/authService";
import usePageTitle from "../hooks/usePageTitle";

const OTP_LENGTH = 6;
const CODE_EXPIRY_SECONDS = 300;
const RESEND_SECONDS = 30;

export default function VerifyEmailPage() {
  usePageTitle("Verify Email");

  const navigate = useNavigate();
  const location = useLocation();

  const [digits, setDigits] = useState(
    Array(OTP_LENGTH).fill("")
  );

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(CODE_EXPIRY_SECONDS);
  const [resendCountdown, setResendCountdown] =
    useState(RESEND_SECONDS);
  const [toast, setToast] = useState("");
  const [shake, setShake] = useState(false);

  const inputsRef = useRef([]);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const email =
    location.state?.email ||
    sessionStorage.getItem("smartdesk_verification_email") ||
    "";

  /*
   * If the user directly visits /verify-email without
   * completing registration first, send them back to register.
   */
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  /*
   * Verification-code expiration countdown.
   */
  useEffect(() => {
    if (!email || status === "success") {
      return;
    }

    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, email, status]);

  /*
   * Resend cooldown.
   */
  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCountdown((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  /*
   * Focus the first OTP input when the page opens.
   */
  useEffect(() => {
    if (email) {
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    }
  }, [email]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleChange = (index, event) => {
    const value = event.target.value;

    /*
     * Only allow one numeric digit.
     */
    if (value && !/^\d$/.test(value)) {
      return;
    }

    setError("");

    const nextDigits = [...digits];
    nextDigits[index] = value;
    setDigits(nextDigits);

    /*
     * Automatically move forward.
     */
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = "";
        setDigits(nextDigits);
        return;
      }

      if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);

        inputsRef.current[index - 1]?.focus();
      }
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /*
   * Allows the user to paste:
   *
   * 123456
   *
   * into any OTP box.
   */
  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    const nextDigits = Array(OTP_LENGTH).fill("");

    pasted.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });

    setDigits(nextDigits);
    setError("");

    const focusIndex = Math.min(
      pasted.length,
      OTP_LENGTH - 1
    );

    inputsRef.current[focusIndex]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const code = digits.join("");

    setError("");

    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit verification code.");
      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);

      return;
    }

    if (countdown <= 0) {
      setError(
        "This verification code has expired. Please request a new code."
      );
      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);

      return;
    }

    setStatus("verifying");

    try {
      await verifyEmail(email, code);

      setStatus("success");

      sessionStorage.removeItem(
        "smartdesk_verification_email"
      );

      setToast("Email verified successfully.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Your email has been verified. You can now log in.",
          },
        });
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        Object.values(err.response?.data || {})[0] ||
        "Invalid or expired verification code.";

      setStatus("idle");
      setError(message);
      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || status === "verifying") {
      return;
    }

    setError("");

    try {
      await resendVerificationCode(email);

      setDigits(Array(OTP_LENGTH).fill(""));
      setCountdown(CODE_EXPIRY_SECONDS);
      setResendCountdown(RESEND_SECONDS);

      setToast("A new verification code has been sent.");

      inputsRef.current[0]?.focus();

      setTimeout(() => {
        setToast("");
      }, 2500);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Unable to resend the verification code.";

      setError(message);
    }
  };

  if (!email) {
    return null;
  }

  const isComplete = digits.every(
    (digit) => digit !== ""
  );

  return (
    <div className="email-verification-page">
      {toast && (
        <div className="otp-toast show">
          {toast}
        </div>
      )}

      <main className="email-verification-card">
        <div className="verification-accent" />

        <div className="verification-content">
          {/* Email icon */}
          <div className="verification-icon-wrapper">
            <div className="verification-icon">
              <span className="material-symbols-outlined">
                mark_email_unread
              </span>
            </div>

            <span className="verification-status-dot">
              <span />
              <span />
            </span>
          </div>

          {/* Heading */}
          <div className="verification-heading">
            <div className="verification-badge">
              <span />
              Verification code sent
            </div>

            <h1>Check your email</h1>

            <p>
              We sent a 6-digit security code to
              <strong>{email}</strong>
            </p>
          </div>

          {/* Form */}
          <form
            className="verification-form"
            onSubmit={handleSubmit}
          >
            <label className="otp-label">
              Enter 6-digit authentication code
            </label>

            <div
              className={`otp-inputs ${
                shake ? "otp-shake" : ""
              }`}
            >
              {digits.map((digit, index) => (
                <div
                  className="otp-input-container"
                  key={index}
                >
                  <input
                    ref={(element) => {
                      inputsRef.current[index] = element;
                    }}
                    className={`otp-input ${
                      digit ? "filled" : ""
                    }`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleChange(index, event)
                    }
                    onKeyDown={(event) =>
                      handleKeyDown(index, event)
                    }
                    onPaste={handlePaste}
                    aria-label={`Verification digit ${
                      index + 1
                    }`}
                    disabled={status === "verifying"}
                  />

                  {index === 2 && (
                    <span className="otp-divider">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="otp-expiry">
              <span className="material-symbols-outlined">
                schedule
              </span>

              {countdown > 0 ? (
                <>
                  Code expires in{" "}
                  <strong>
                    {formatTime(countdown)}
                  </strong>
                </>
              ) : (
                <strong className="expired">
                  Code expired
                </strong>
              )}
            </div>

            {error && (
              <p className="form-error verification-error">
                {error}
              </p>
            )}

            <button
              className="submit-button verification-submit"
              type="submit"
              disabled={
                status === "verifying" ||
                !isComplete ||
                countdown <= 0
              }
            >
              {status === "verifying"
                ? "Verifying..."
                : status === "success"
                  ? "Verified"
                  : "Verify & Continue"}

              {status !== "verifying" &&
                status !== "success" && (
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                )}
            </button>
          </form>

          {/* Resend */}
          <div className="verification-actions">
            <div className="resend-text">
              Didn't receive the email?

              <button
                type="button"
                className="otp-resend"
                disabled={
                  resendCountdown > 0 ||
                  status === "verifying"
                }
                onClick={handleResend}
              >
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : "Click to resend"}
              </button>
            </div>

            <div className="verification-helper">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined">
                  mail
                </span>
                Open Gmail
              </a>

              <span>•</span>

              <Link to="/register">
                <span className="material-symbols-outlined">
                  edit
                </span>
                Change email
              </Link>
            </div>
          </div>

          {/* Back to login */}
          <div className="back-to-login">
            <Link to="/login">
              <span className="material-symbols-outlined">
                arrow_back
              </span>
              Back to Sign in
            </Link>
          </div>
        </div>

        {/* Security strip */}
        <div className="verification-security">
          <div>
            <span className="material-symbols-outlined">
              verified_user
            </span>

            <span>
              Secure email verification
            </span>
          </div>

          <span className="security-id">
            SmartDesk
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="verification-footer">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#help">Help Center</a>
      </footer>
    </div>
  );
}