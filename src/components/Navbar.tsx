import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

interface NavbarProps {
  user: { id: string; username: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const location = useLocation();

  const StyledWrapper = styled.div`
    .boton-elegante {
      padding: 8px 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-size: 0.95rem;
      cursor: pointer;
      border-radius: 12px;
      transition: background-color 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
      outline: none;
      position: relative;
      overflow: hidden;
      font-weight: 600;
    }

    .boton-elegante::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%);
      transform: scale(0);
      transition: transform 0.4s ease;
    }

    .boton-elegante:hover::after {
      transform: scale(4);
    }

    .boton-elegante:hover {
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.16);
    }
  `;

  return (
    <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/10 border-b border-white/10">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded"></div>
                <div className="w-2 h-2 bg-white rounded"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded"></div>
                <div className="w-2 h-2 bg-white rounded"></div>
              </div>
            </div>
            <span className="text-xl font-bold text-white">Insulin Drug Synthesis</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/models"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/models'
                  ? 'text-blue-300'
                  : 'text-white/90 hover:text-blue-300'
              }`}
            >
              Services
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/about'
                  ? 'text-blue-300'
                  : 'text-white/90 hover:text-blue-300'
              }`}
            >
              About
            </Link>
            <Link
              to="/features"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/features'
                  ? 'text-blue-300'
                  : 'text-white/90 hover:text-blue-300'
              }`}
            >
              Features
            </Link>
            <Link
              to="/documentation"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/documentation'
                  ? 'text-blue-300'
                  : 'text-white/90 hover:text-blue-300'
              }`}
            >
              Documentation
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <StyledWrapper>
                <Link to="/login" className="inline-block">
                  <button className="boton-elegante">Sign in</button>
                </Link>
              </StyledWrapper>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


