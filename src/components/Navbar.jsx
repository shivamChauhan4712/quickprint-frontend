import { useNavigate } from 'react-router-dom';

export function Navbar(){
  const navigate = useNavigate();
  const cafeName = localStorage.getItem('cafeName') || 'Cafe';

  const handleLogout = () => {
    localStorage.clear(); // Token aur details delete karo
    navigate('/login');
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
