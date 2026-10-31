import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = 'https://inai-col2.fishrungames.com'

type Profile = {
  first_name: string
  specialization: string
  specialization_display: string
  bio: string
  fee: string
}

type User = {
  id: number
  username: string
  profile: Profile
}

type Choice = { value: string; label: string }

const specializationChoices: Choice[] = [
  { value: 'vocals', label: 'Вокал' },
  { value: 'guitar', label: 'Гитара' },
  { value: 'bass', label: 'Бас-гитара' },
  { value: 'drums', label: 'Ударные' },
  { value: 'keys', label: 'Клавишные' },
  { value: 'other', label: 'Другое' },
]

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.detail || Object.values(body || {})[0] || `Ошибка ${response.status}`
    throw new Error(Array.isArray(message) ? message[0] : String(message))
  }
  return response.status === 204 ? ({} as T) : response.json()
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [choices, setChoices] = useState<Choice[]>(specializationChoices)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    Promise.all([
      request<User>('/api/profile/').then(setUser).catch(() => undefined),
      request<Choice[]>('/api/specializations/').then(setChoices).catch(() => undefined),
    ]).finally(() => setLoading(false))
  }, [])

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    const form = new FormData(event.currentTarget)
    try {
      const path = authMode === 'login' ? '/api/login/' : '/api/register/'
      const result = await request<User>(path, {
        method: 'POST',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password'),
        }),
      })
      setUser(result)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Не удалось выполнить запрос')
    } finally {
      setAuthLoading(false)
    }
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    setProfileLoading(true)
    setProfileError('')
    setProfileMessage('')
    const form = new FormData(event.currentTarget)
    try {
      const updated = await request<User>('/api/profile/', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: form.get('first_name'),
          bio: form.get('bio'),
          specialization: form.get('specialization'),
        }),
      })
      setUser(updated)
      setProfileMessage('Профиль обновлён')
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Не удалось сохранить изменения')
    } finally {
      setProfileLoading(false)
    }
  }

  const logout = async () => {
    try {
      await request('/api/logout/', { method: 'POST' })
      setUser(null)
      setAuthMode('login')
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Не удалось выйти')
    }
  }

  if (loading) {
    return <div className="loading-screen"><div className="loader-ring" /><p>Настраиваем звук<span>...</span></p></div>
  }

  return (
    <main>
      <header className="topbar">
        <div className="header-action">
          {user && <span className="user-name">{user.username}</span>}
        </div>
      </header>

      {user ? (
        <section className="profile-section" id="profile">
          <div className="profile-header"><div><p className="eyebrow">Личный кабинет</p><h1>Мой профиль</h1><p className="profile-intro">Просматривайте и редактируйте данные своего профиля.</p></div><button className="outline-button" onClick={logout}>Выйти</button></div>
          <form className="profile-form" onSubmit={saveProfile}>
            <label>Имя / псевдоним<input name="first_name" defaultValue={user.profile?.first_name} placeholder="Как тебя зовут?" maxLength={100} /></label>
            <label>Твоя роль<select name="specialization" defaultValue={user.profile?.specialization || 'other'}>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select></label>
            <label className="full-field">О себе<textarea name="bio" defaultValue={user.profile?.bio} placeholder="Расскажи о себе и своей музыке..." rows={4} /></label>
            <div className="form-actions"><button className="primary-button" type="submit" disabled={profileLoading}>{profileLoading ? 'Сохраняем...' : 'Сохранить изменения'} <span>↗</span></button>{profileMessage && <span className="success-message">{profileMessage}</span>}{profileError && <span className="error-message">{profileError}</span>}</div>
          </form>
        </section>
      ) : (
        <section className="auth-section" id="auth">
          <div className="auth-grid">
            <div><p className="eyebrow">Профиль музыканта</p><h1>Добро<br /><em>пожаловать.</em></h1><p>Войдите или зарегистрируйтесь, чтобы управлять своим профилем.</p></div>
            <div className="auth-card">
              <div className="auth-tabs"><button className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>Войти</button><button className={authMode === 'register' ? 'active' : ''} onClick={() => { setAuthMode('register'); setAuthError('') }}>Регистрация</button></div>
              <form onSubmit={submitAuth}><label>Логин<input name="username" required autoComplete="username" placeholder="your_name" /></label><label>Пароль<input name="password" required minLength={6} type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••" /></label>{authError && <p className="error-message">{authError}</p>}<button className="primary-button form-submit" type="submit" disabled={authLoading}>{authLoading ? 'Подождите...' : authMode === 'login' ? 'Войти в кабинет' : 'Создать профиль'} <span>↗</span></button></form>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
