import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <main>
                {children}
            </main>

            {/* Bottom Navigation Bar */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '480px',
                backgroundColor: 'white',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0.75rem 0',
                zIndex: 50,
                boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <NavLink to="/" icon={<HomeIcon />} label="Home" active={isActive('/')} />
                <NavLink to="/analyze" icon={<ScanIcon />} label="Scan" active={isActive('/analyze')} />
                <NavLink to="/profile" icon={<UserIcon />} label="Profile" active={isActive('/profile')} />
            </nav>
        </div>
    );
}

function NavLink({ to, icon, label, active }) {
    return (
        <Link to={to} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: active ? 'var(--primary-dark)' : 'var(--text-light)',
            transition: 'color 0.2s'
        }}>
            <div style={{
                marginBottom: '4px',
                color: active ? 'var(--primary)' : 'currentColor'
            }}>
                {React.cloneElement(icon, { fill: active ? 'currentColor' : 'none', stroke: 'currentColor' })}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>
        </Link>
    );
}

// Icons
function HomeIcon(props) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    );
}

function ScanIcon(props) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
    );
}

function UserIcon(props) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
}
