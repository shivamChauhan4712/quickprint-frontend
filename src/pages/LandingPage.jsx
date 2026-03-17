import React from "react";
import { Link } from "react-router-dom";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/">
            <i className="bi bi-printer-fill me-2"></i>QuickPrint
          </Link>
          <div className="d-flex border-0">
            <button
              className="btn btn-outline-primary me-2"
              data-bs-toggle="modal"
              data-bs-target="#loginModal"
            >
              Login
            </button>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#signupModal"
            >
              Join as Cafe
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-5 bg-light">
        <div className="container px-5">
          <div className="row gx-5 align-items-center justify-content-center">
            <div className="col-lg-8 col-xl-7 col-xxl-6">
              <div className="my-5 text-center text-xl-start">
                <h1 className="display-4 fw-bolder text-dark mb-2">
                  Instant Printing for Every Customer.
                </h1>
                <p className="lead fw-normal text-muted mb-4">
                  No more cables, no more emails. Just scan the QR code, upload
                  your file, and get it printed in seconds.
                </p>
                <div className="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-xl-start">
                  <button
                    className="btn btn-primary btn-lg px-4 me-sm-3"
                    data-bs-toggle="modal"
                    data-bs-target="#signupModal"
                  >
                    Get Started
                  </button>
                  <a
                    className="btn btn-outline-dark btn-lg px-4"
                    href="#features"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-xl-5 col-xxl-6 d-none d-xl-block text-center">
              <i
                className="bi bi-qr-code-scan text-primary"
                style={{ fontSize: "12rem" }}
              ></i>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-5" id="features">
        <div className="container px-5 my-5">
          <div className="row gx-5">
            <div className="col-lg-4 mb-5 mb-lg-0 text-center">
              <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3 p-3 d-inline-block">
                <i className="bi bi- lightning-charge-fill fs-2"></i>
              </div>
              <h2 className="h4 fw-bolder">Fast & Easy</h2>
              <p className="text-muted">
                Customers upload files directly from their mobile devices via QR
                scan.
              </p>
            </div>
            <div className="col-lg-4 mb-5 mb-lg-0 text-center">
              <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3 p-3 d-inline-block">
                <i className="bi bi-shield-check fs-2"></i>
              </div>
              <h2 className="h4 fw-bolder">Secure Transfers</h2>
              <p className="text-muted">
                Files are stored securely and automatically deleted after
                printing.
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3 p-3 d-inline-block">
                <i className="bi bi-graph-up-arrow fs-2"></i>
              </div>
              <h2 className="h4 fw-bolder">Manage Effectively</h2>
              <p className="text-muted">
                Real-time dashboard to manage all pending print requests
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-5 bg-dark text-white">
        <div className="container px-5 my-5">
          <div className="text-center mb-5">
            <h2 className="fw-bolder">How it Works</h2>
            <p className="lead fw-normal text-muted mb-0">
              Simple steps to digitize your print shop
            </p>
          </div>
          <div className="row gx-5">
            <div className="col-lg-4 text-center">
              <div className="display-5 fw-bold text-primary mb-2">01</div>
              <h5>Register Your Cafe</h5>
              <p className="small text-muted">
                Create an account and get your unique QR code.
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <div className="display-5 fw-bold text-primary mb-2">02</div>
              <h5>Customer Scans & Uploads</h5>
              <p className="small text-muted">
                Customer scans the QR at your desk and uploads their PDF/Image.
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <div className="display-5 fw-bold text-primary mb-2">03</div>
              <h5>One-Click Print</h5>
              <p className="small text-muted">
                You see the file on your dashboard and hit print. Done!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-4 mt-auto border-top">
        <div className="container px-5">
          <div className="row align-items-center justify-content-between flex-column flex-sm-row">
            <div className="col-auto">
              <div className="small m-0 text-muted">
                Copyright &copy; QuickPrint 2026
              </div>
            </div>
            <div className="col-auto">
              <a className="link-dark small" href="#!">
                Privacy
              </a>
              <span className="text-muted mx-1">&middot;</span>
              <a className="link-dark small" href="#!">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
      <LoginModal />
      <SignupModal />
    </div>
  );
}
