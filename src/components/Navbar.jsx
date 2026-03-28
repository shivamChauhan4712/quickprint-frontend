import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export function Navbar(){
  const navigate = useNavigate();
  const cafeName = localStorage.getItem('cafeName') || 'Cafe';

const handleLogout = () => {
    // 1. clearing the LocalStorage
    localStorage.removeItem("uniqueCode");
    localStorage.getItem("cafeName") && localStorage.removeItem("cafeName");
    localStorage.removeItem("token"); 

    // 2. User ko SweetAlert se bye-bye bolo (Professional feel)
    Swal.fire({
      title: "Logged Out!",
      text: "You have been logged out successfully.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });

    // 3. navigate to Landing page
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <a className="navbar-brand fw-bold" href="/dashboard">
          <i className="bi bi-printer-fill me-2"></i>QuickPrint
        </a>
        <div className="d-flex align-items-center">
          <span className="text-white me-3 d-none d-md-inline">
            Welcome, <strong>{cafeName}</strong>
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
