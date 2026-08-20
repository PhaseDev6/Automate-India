'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Debug skip code: Set a dummy cookie to persist login state across reloads
    document.cookie = "auth_token=debug_session; path=/; max-age=86400"
    // Force a full refresh to let middleware pick up the cookie
    window.location.href = '/'
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="brand-mark"><Leaf size={24} strokeWidth={2.5} /></div>
          <span style={{ fontSize: '1.5rem' }}>verdant<span className="brand-dot">.</span></span>
        </div>
        <h2>Welcome back</h2>
        <p className="subheading" style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign in to municipal operations dashboard</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <label>Email address
            <input type="email" placeholder="admin@metrocity.gov" required value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label>Password
            <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          
          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
            Sign In (Debug Skip)
          </button>
        </form>
      </div>
    </div>
  )
}
