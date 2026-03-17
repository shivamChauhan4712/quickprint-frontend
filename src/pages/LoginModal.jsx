import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../api/api";

export function LoginModal() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const response = await api.post("/api/cafes/login", data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("uniqueCode", response.data.uniqueCode);
      localStorage.setItem("cafeName", response.data.cafeName);

      // to close the modal using bootstrap utility
      const modalElement = document.getElementById("loginModal");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
      navigate("/dashboard");
    } catch (err) {
      // Backend error message or default fallback
      setServerError(
        err.response?.data?.message ||
          err.response?.data ||
          "Authentication failed. Please check your credentials.",
      );
    }
  };

  return (
    <div
      className="modal fade"
      id="loginModal"
      tabIndex="-1"
      aria-labelledby="loginModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-5 pt-0">
            <div className="text-center mb-4">
              <i
                className="bi bi-printer-fill text-primary"
                style={{ fontSize: "3rem" }}
              ></i>
              <h2 className="fw-bold mt-2">QuickPrint Login</h2>
              <p className="text-muted">Access your cafe dashboard</p>
            </div>

            {serverError && (
              <div className="alert alert-danger text-center small">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label fw-bold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control bg-light border-start-0 ${errors.email ? "is-invalid" : ""}`}
                    placeholder="owner@cafe.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <div className="text-danger extra-small mt-1">
                    {errors.email.message}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className={`form-control bg-light border-start-0 ${errors.password ? "is-invalid" : ""}`}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                </div>
                {errors.password && (
                  <div className="text-danger extra-small mt-1">
                    {errors.password.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
              >
                Sign In <i className="bi bi-box-arrow-in-right ms-2"></i>
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">Don't have an account? </span>
              <button
                type="button"
                className="btn btn-link p-0 small text-decoration-none fw-bold text-primary"
                data-bs-toggle="modal"
                data-bs-target="#signupModal"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    // <div className="container mt-5">
    //   <div className="row justify-content-center">
    //     <div className="col-md-5">
    //       <div className="card shadow-lg border-0">
    //         <div className="card-body p-5">
    //           <div className="text-center mb-4">
    //             <i className="bi bi-printer-fill text-primary" style={{ fontSize: '3rem' }}></i>
    //             <h2 className="fw-bold mt-2">QuickPrint Login</h2>
    //             <p className="text-muted">Access your cafe dashboard</p>
    //           </div>

    //           {serverError && <div className="alert alert-danger text-center">{serverError}</div>}

    //           <form onSubmit={handleSubmit(onSubmit)}>
    //             <div className="mb-3">
    //               <label className="form-label fw-bold">Email Address</label>
    //               <div className="input-group">
    //                 <span className="input-group-text"><i className="bi bi-envelope"></i></span>
    //                 <input
    //                   type="email"
    //                   className={`form-control ${errors.email ? 'is-invalid' : ''}`}
    //                   placeholder="e.g. owner@cafe.com"
    //                   {...register("email", {
    //                     required: "Email is required",
    //                     pattern: { value: /^\S+@\S+$/i, message: "Please enter a valid email address" }
    //                   })}
    //                 />
    //               </div>
    //               {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
    //             </div>

    //             <div className="mb-4">
    //               <label className="form-label fw-bold">Password</label>
    //               <div className="input-group">
    //                 <span className="input-group-text"><i className="bi bi-lock"></i></span>
    //                 <input
    //                   type="password"
    //                   className={`form-control ${errors.password ? 'is-invalid' : ''}`}
    //                   placeholder="••••••••"
    //                   {...register("password", {
    //                     required: "Password is required",
    //                     minLength: { value: 6, message: "Password must be at least 6 characters" }
    //                   })}
    //                 />
    //               </div>
    //               {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
    //             </div>

    //             <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm">
    //               Sign In <i className="bi bi-box-arrow-in-right ms-2"></i>
    //             </button>
    //           </form>

    //           <div className="text-center mt-4">
    //             <span className="text-muted">Don't have an account? </span>
    //             <Link to="/register" className="text-decoration-none">Register your Cafe</Link>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
