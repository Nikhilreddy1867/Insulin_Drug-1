import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { id: string; username: string }) => void;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
  };
  error?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<'default' | 'google' | 'mobile'>('default');
  const navigate = useNavigate();
  // Email OTP flow
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState<'collect' | 'otp' | 'setPassword'>('collect');
  // Mobile OTP flow
  const [mobile, setMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileStep, setMobileStep] = useState<'collect' | 'otp' | 'setPassword'>('collect');
  // New password for OTP signup
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI-only state for spotlight effect and carousel positioning
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const methods: Array<'default' | 'google' | 'mobile'> = ['default', 'google', 'mobile'];
  const selectedIndex = methods.indexOf(selectedAuthMethod);

  // Position helpers for carousel animation
  const getPositionIndex = (method: 'default' | 'google' | 'mobile') => {
    const idx = methods.indexOf(method);
    return (idx - selectedIndex + methods.length) % methods.length; // 0: middle, 1: right, 2: left
  };
  const getTransformFor = (posIndex: number) => {
    if (posIndex === 0) return 'translateX(0) scale(1.06) rotateY(0deg)';
    if (posIndex === 1) return 'translateX(420px) scale(0.92) rotateY(-10deg)';
    return 'translateX(-420px) scale(0.92) rotateY(10deg)';
  };

  // Password strength helper
  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const percent = Math.min(100, (score / 5) * 100);
    const label = score <= 2 ? 'Weak' : score === 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong';
    const color = score <= 2 ? 'bg-red-500' : score === 3 ? 'bg-yellow-500' : score === 4 ? 'bg-green-500' : 'bg-emerald-600';
    return { score, percent, label, color };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setSuccess(data.message);
        if (isLogin && data.user) {
          onLogin(data.user!);
          navigate('/', { replace: true });
        } else if (!isLogin) {
          // Switch to login mode after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setSuccess(null);
          }, 2000);
        }
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Unable to connect to the server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setUsername('');
    setPassword('');
    // reset OTP flows
    setSelectedAuthMethod('default');
    setEmail('');
    setEmailOtp('');
    setEmailStep('collect');
    setMobile('');
    setMobileOtp('');
    setMobileStep('collect');
    setNewPassword('');
    setConfirmPassword('');
  };

  // (removed unused handleSelectAuth)

  // Google OAuth handler - Simple redirect approach
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError(null);

    // Direct redirect to Google OAuth endpoint
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  // Email OTP handlers
  const requestEmailOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5001/api/request-otp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('OTP sent to email');
        setEmailStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (e) {
      setError('Unable to request OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5001/api/verify-otp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('OTP verified');
        setEmailStep('setPassword');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (e) {
      setError('Unable to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const setEmailPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5001/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      });
      const data: AuthResponse = await res.json();
      if (data.success && data.user) {
        setSuccess('Account created');
        onLogin(data.user);
        navigate('/', { replace: true });
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (e) {
      setError('Unable to set password');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile OTP handlers
  const requestMobileOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5001/api/request-otp-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile, username }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('OTP sent to mobile');
        setMobileStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (e) {
      setError('Unable to request OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMobileOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5001/api/verify-otp-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile, otp: mobileOtp }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('OTP verified');
        setMobileStep('setPassword');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (e) {
      setError('Unable to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const setMobilePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5001/api/set-password-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      });
      const data: AuthResponse = await res.json();
      if (data.success && data.user) {
        setSuccess('Account created');
        onLogin(data.user);
        navigate('/', { replace: true });
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (e) {
      setError('Unable to set password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="page-container min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden py-8"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      style={{ ['--x' as any]: `${mousePos.x}px`, ['--y' as any]: `${mousePos.y}px` }}
    >
      {/* Page-level mouse tracking spotlight */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(700px circle at var(--x) var(--y), rgba(255,255,255,0.08), transparent 45%)' }} />

      {/* Top-left Go to homepage button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="btn-outline-fill">
          Go to homepage
        </Link>
      </div>

      {/* Top-right Sign In/Up toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleMode}
          disabled={isLoading}
          className="btn-outline-fill"
          title={isLogin ? 'Switch to Sign up' : 'Switch to Sign in'}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </div>

      {/* Main Container - Properly spaced */}
      <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center justify-center gap-8">
        {/* Logo/Avatar - Top Section */}
        <div className="flex flex-col items-center mb-12 md:mb-14">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neutral-700 to-neutral-500 flex items-center justify-center shadow-2xl mb-3 animate-scaleIn">
            <span className="text-white text-2xl font-bold">T2D</span>
          </div>
          <span className="text-xl font-bold text-white animate-fadeIn">Insulin Predictor</span>
          <p className="text-blue-200 text-xs mt-1 animate-fadeIn">
            {isLogin ? 'Sign in to access the protein prediction tool' : 'Create a new account to get started'}
          </p>
        </div>

        {/* Three Authentication Blocks - Rotating Carousel (animated) */}
        <div className="w-full max-w-6xl mb-6 mt-2 md:mt-4">
          <div className="relative flex items-center justify-center min-h-[420px] py-8" style={{ perspective: '1200px', transformStyle: 'preserve-3d' as any }}>

            {methods.map((method) => {
              const posIndex = getPositionIndex(method);
              const isSelected = posIndex === 0;
              const z = isSelected ? 30 : 10;
              const widthClass = isSelected ? 'w-96' : 'w-80';
              const cursor = isSelected ? 'cursor-default' : 'cursor-pointer';
              const onClick = () => {
                if (!isSelected) setSelectedAuthMethod(method);
              };
              return (
                <div
                  key={method}
                  className={`absolute ${widthClass} ${cursor} select-none`}
                  style={{
                    transition: 'transform 650ms cubic-bezier(0.22, 0.61, 0.36, 1), filter 650ms, opacity 650ms',
                    transform: getTransformFor(posIndex),
                    filter: isSelected ? 'brightness(1) saturate(1.05)' : 'brightness(0.85) saturate(0.9)',
                    opacity: isSelected ? 1 : 0.9,
                    zIndex: z,
                    willChange: 'transform, filter, opacity',
                  }}
                  onClick={onClick}
                >
                  {method === 'default' && (
                    <form onSubmit={handleSubmit} className={`text-center bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md ${isSelected ? 'p-8' : 'p-6 hover:bg-white/15'}`} onClick={(e) => isSelected ? null : e.preventDefault()}>
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-indigo-600/20 text-indigo-300">
                        <User className="w-8 h-8" />
                      </div>
                      <h3 className={`${isSelected ? 'text-2xl' : 'text-lg'} font-bold text-white mb-1`}>Guest Login</h3>
                      <p className={`${isSelected ? 'text-sm mb-5' : 'text-xs mb-4'} text-neutral-300`}>Sign in with username and password</p>

                      {isSelected ? (
                        <>
                          <div className="relative mb-4">
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" placeholder="Username" disabled={isLoading} />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-white/70" /></div>
                          </div>
                          <div className="relative mb-5">
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" placeholder="Password" disabled={isLoading} />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-white/70" /></div>
                            <button
                              type="button"
                              className="btn-plain-icon inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
                              onClick={() => setShowPassword((prev) => !prev)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {!isLogin && password && (
                            <div className="space-y-1 mb-4">
                              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden"><div className={`${passwordStrength(password).color} h-2`} style={{ width: `${passwordStrength(password).percent}%` }}></div></div>
                              <div className="text-xs text-neutral-400">Password strength: {passwordStrength(password).label}</div>
                            </div>
                          )}
                          <button type="submit" disabled={isLoading || !username.trim() || !password.trim()} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:from-indigo-500 hover:to-blue-500 disabled:from-neutral-600 disabled:to-neutral-700 disabled:cursor-not-allowed hover-shine no-lift">
                            {isLoading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block align-middle"></div>
                                {isLogin ? 'Signing In...' : 'Creating Account...'}
                              </>
                            ) : (
                              <>
                                {isLogin ? <LogIn className="w-5 h-5 inline-block mr-2" /> : <UserPlus className="w-5 h-5 inline-block mr-2" />}
                                {isLogin ? 'Sign In' : 'Create Account'}
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="text-neutral-300 text-xs">Click to focus</div>
                      )}
                    </form>
                  )}

                  {method === 'google' && (
                    <div className={`text-center bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md ${isSelected ? 'p-8' : 'p-6 hover:bg-white/15'}`}>
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-500/20 text-red-300"><svg className="w-8 h-8" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></div>
                      <h3 className={`${isSelected ? 'text-2xl' : 'text-lg'} font-bold text-white mb-1`}>Google Sign In</h3>
                      <p className={`${isSelected ? 'text-sm mb-5' : 'text-xs mb-4'} text-neutral-300`}>Continue with your Google account</p>
                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className={`w-full py-3 ${isSelected ? 'btn-total-glow no-shine no-lift' : ''}`}
                      >
                        <span>{isLoading ? 'Connecting…' : 'Continue with Google'}</span>
                        <span />
                      </button>
                    </div>
                  )}

                  {method === 'mobile' && (
                    <div className={`text-center bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md ${isSelected ? 'p-8' : 'p-6 hover:bg-white/15'}`}>
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-emerald-500/20 text-emerald-300"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M9 18h6"/></svg></div>
                      <h3 className={`${isSelected ? 'text-2xl' : 'text-lg'} font-bold text-white mb-1`}>Mobile OTP</h3>
                      <p className={`${isSelected ? 'text-sm mb-5' : 'text-xs mb-4'} text-neutral-300`}>Sign in with mobile number and OTP</p>
                      {isSelected ? (
                        <div className="space-y-4">
                          {mobileStep === 'collect' && (
                            <div className="space-y-3">
                              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" disabled={isLoading} />
                              <div className="flex gap-2">
                                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" className="flex-1 px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" disabled={isLoading} />
                                <button type="button" onClick={() => requestMobileOtp()} disabled={!mobile || !username || isLoading} className="px-4 py-3 btn-ridge-glow text-sm no-shine no-lift disabled:cursor-not-allowed">Send OTP</button>
                              </div>
                            </div>
                          )}
                          {mobileStep === 'otp' && (
                            <div className="flex gap-2">
                              <input type="text" value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value)} placeholder="Enter OTP" className="flex-1 px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" disabled={isLoading} />
                              <button type="button" onClick={() => verifyMobileOtp()} disabled={!mobileOtp || isLoading} className="px-4 py-3 btn-ridge-glow text-sm no-shine no-lift disabled:cursor-not-allowed">Verify</button>
                            </div>
                          )}
                          {mobileStep === 'setPassword' && (
                            <div className="space-y-3">
                              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Create password" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                              {(() => { const s = passwordStrength(newPassword); return (
                                <div className="space-y-1"><div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden"><div className={`${s.color} h-2`} style={{ width: `${s.percent}%` }}></div></div><div className="text-xs text-neutral-400">Password strength: {s.label}</div></div>
                              ); })()}
                              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                              <button type="button" onClick={() => setMobilePassword()} disabled={!newPassword || newPassword !== confirmPassword || isLoading} className="w-full py-3 btn-ridge-glow text-sm no-shine no-lift disabled:cursor-not-allowed">Set Password & Continue</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-neutral-300 text-xs">Click to focus</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error and Success Messages */}
        {(error || success) && (
          <div className="w-full max-w-md px-4 mt-4">
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl animate-fadeIn shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl animate-fadeIn shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;




