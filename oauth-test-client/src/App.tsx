import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://saber-api-backend.vercel.app/api';
  
  // Configuration
  const GOOGLE_CLIENT_ID = '942388377321-su1u7ofm0ck76pvkiv07ksl8k9esfls6.apps.googleusercontent.com';
  const GITHUB_CLIENT_ID = 'Ov23lijOpMktUNXB6FYD';
  const LINKEDIN_CLIENT_ID = '86v3erqkn6uuka';
  
  const BACKEND_REDIRECT_URI = 'https://saber-api-backend.vercel.app/api/auth/oauth/callback';

  // Automatically handle validation code return from backend redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    // Read provider from state param, fallback to google if missing
    // or fallback to localStorage if state is missing (for backward compat)
    const stateProvider = params.get('state'); 
    
    if (code) {
      const provider = stateProvider || localStorage.getItem('auth_provider') || 'google';
      console.log('Exchanging code for provider:', provider);
      exchangeCode(code, provider);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.removeItem('auth_provider');
    }
  }, []);

  const loginWithGoogle = () => {
    const provider = 'google';
    localStorage.setItem('auth_provider', provider); // Fallback
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${BACKEND_REDIRECT_URI}&response_type=code&scope=openid%20email&state=${provider}`;
    window.location.href = authUrl;
  };

  const loginWithGitHub = () => {
    const provider = 'github';
    localStorage.setItem('auth_provider', provider); // Fallback
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${BACKEND_REDIRECT_URI}&scope=read:user%20user:email%20public_repo&state=${provider}`;
    window.location.href = authUrl;
  };

  const loginWithLinkedIn = () => {
    const provider = 'linkedin';
    localStorage.setItem('auth_provider', provider); // Fallback
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${BACKEND_REDIRECT_URI}&response_type=code&scope=openid%20profile%20email&state=${provider}`;
    window.location.href = authUrl;
  };

  const exchangeCode = async (code: string, provider: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/oauth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, code })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to exchange token');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('jwt_token', data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <div className="container">
      <h1>🔐 SABER OAuth Client Test</h1>
      
      {token ? (
        <div className="card logged-in">
          <h2>✅ Authenticated!</h2>
          <div className="user-info">
            {user && (
              <>
                {user.photo_url && <img src={user.photo_url} alt="Profile" style={{width: 60, height: 60, borderRadius: '50%'}} />}
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </>
            )}
            <div className="token-box">
              <h3>JWT Token:</h3>
              <pre>{token}</pre>
              <button onClick={() => navigator.clipboard.writeText(token)}>Copy Token</button>
            </div>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      ) : (
        <div className="card login-box">
          <p>Test the OAuth flow just like the real frontend.</p>
          
          <div className="buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="google-btn" onClick={loginWithGoogle}>
              Sign in with Google
            </button>
            <button className="google-btn" style={{ background: '#333' }} onClick={loginWithGitHub}>
              Sign in with GitHub
            </button>
            <button className="google-btn" style={{ background: '#0077b5' }} onClick={loginWithLinkedIn}>
              Sign in with LinkedIn
            </button>
          </div>


          {error && <div className="error-message">⚠️ {error}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
