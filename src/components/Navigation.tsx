import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  const navItems = [
    { path: '/', label: 'Fridge' },
    { path: '/cooking', label: 'Cooking' },
    { path: '/shopping', label: 'Shopping' },
    { path: '/statistics', label: 'Statistics' },
    { path: '/settings', label: 'Settings' },
  ];

  if (isMobile) {
    // Breadcrumb navigation for mobile
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = pathParts.map((part, idx) => {
      const path = '/' + pathParts.slice(0, idx + 1).join('/');
      return { path, label: part.charAt(0).toUpperCase() + part.slice(1) };
    });

    return (
      <nav className="navigation mobile">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.path}>
              <span className="separator">/</span>
              <Link to={crumb.path}>{crumb.label}</Link>
            </span>
          ))}
        </div>
      </nav>
    );
  }

  // Top navigation bar for desktop
  return (
    <nav className="navigation desktop">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;

