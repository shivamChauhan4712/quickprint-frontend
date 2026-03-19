import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Swal from "sweetalert2";

export function SignupModal() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      const payload = {
        cafeName: data.cafeName,
        ownerEmail: data.ownerEmail,
        password: data.password,
      };

      const response = await api.post("/api/cafes/register", payload);

      // important CHECK: if status is 200 or 201 then success
      if (response.status === 200 || response.status === 201) {
        // close Modal
        const modalElement = document.getElementById("signupModal");
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        Swal.fire({
          title: "Success!",
          text: "Registration Successful! Please login to continue.",
          icon: "success",
          confirmButtonColor: "#198754",
        });

        navigate("/"); // Login modal or landing page
      }
    } catch (err) {
      console.error("Signup Error Object:", err); //for Debugging

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed.";
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="signupModal"
      tabIndex="-1"
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
                className="bi bi-person-plus-fill text-success"
                style={{ fontSize: "3rem" }}
              ></i>
              <h2 className="fw-bold mt-2">Create Cafe Account</h2>
              <p className="text-muted small">
                Register to get your unique QR code
              </p>
            </div>

            {serverError && (
              <div className="alert alert-danger small">{serverError}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Cafe Name */}
              <div className="mb-3">
                <label className="form-label fw-bold small">Cafe Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-shop text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control bg-light ${errors.cafeName ? "is-invalid" : ""}`}
                    placeholder="e.g. Rahul Graphics"
                    {...register("cafeName", {
                      required: "Cafe name is required",
                    })}
                  />
                </div>
                {errors.cafeName && (
                  <div className="text-danger extra-small mt-1">
                    {errors.cafeName.message}
                  </div>
                )}
              </div>

              {/* Owner Email */}
              <div className="mb-3">
                <label className="form-label fw-bold small">Owner Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control bg-light ${errors.ownerEmail ? "is-invalid" : ""}`}
                    placeholder="rahulgraphics3542@gmail.com"
                    {...register("ownerEmail", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email",
                      },
                    })}
                  />
                </div>
                {errors.ownerEmail && (
                  <div className="text-danger small mt-1">
                    {errors.ownerEmail.message}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-bold small">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className={`form-control bg-light ${errors.password ? "is-invalid" : ""}`}
                    placeholder="Min 6 characters"
                    {...register("password", {
                      required: "Password is Required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                </div>
                {errors.password && (
                  <div className="text-danger small mt-1">
                    {errors.password.message}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label fw-bold small">
                  Confirm Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-shield-lock text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className={`form-control bg-light ${errors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="Repeat password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="text-danger small mt-1">
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-success w-100 py-2 fw-bold shadow-sm"
              >
                {loading ? "Registering..." : "Register Cafe"}{" "}
                <i className="bi bi-check-circle ms-2"></i>
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">
                Already have an account?{" "}
              </span>
              <button
                className="btn btn-link p-0 small text-decoration-none fw-bold text-success"
                data-bs-toggle="modal"
                data-bs-target="#loginModal"
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
