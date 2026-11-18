import { useState } from 'react';
import { translate } from '../i18n/translations';
import { continueAsGuest, loginUser, registerUser } from '../utils/auth';
import { BrandMark } from './Icons';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({ lang, onChangeLang, onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorKey, setErrorKey] = useState('');
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (key, vars) => translate(lang, key, vars);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorKey('');
    setNotice(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleContinueGuest = () => {
    const guestUser = continueAsGuest();
    onAuthenticated(guestUser);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorKey('');
    setNotice(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (mode === 'signup' && !cleanName) {
      setErrorKey('authErrName');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorKey('authErrEmail');
      return;
    }
    if (password.length < 6) {
      setErrorKey('authErrPasswordLen');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setErrorKey('authErrPasswordMatch');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const result = await registerUser({
          name: cleanName,
          email: cleanEmail,
          password,
        });
        if (result.needsEmailConfirmation) {
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          setNotice({ key: 'authConfirmEmailNotice', vars: { email: result.email } });
          return;
        }
        await onAuthenticated(result.user);
      } else {
        const result = await loginUser({ email: cleanEmail, password });
        await onAuthenticated(result.user);
      }
    } catch (err) {
      setErrorKey(err?.message || 'authErrGeneric');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <div className="brand">
          <BrandMark size={26} />
          <span className="brand__name">Honey Book</span>
        </div>

        <div className="lang-switcher" role="group" aria-label={t('languageLabel')}>
          <button
            type="button"
            id="auth-lang-en"
            className={`lang-switcher__btn ${lang === 'en' ? 'is-active' : ''}`}
            onClick={() => onChangeLang('en')}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
          <button
            type="button"
            id="auth-lang-es"
            className={`lang-switcher__btn ${lang === 'es' ? 'is-active' : ''}`}
            onClick={() => onChangeLang('es')}
            aria-pressed={lang === 'es'}
          >
            ES
          </button>
        </div>
      </div>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-card__head">
            <span className="eyebrow-label">{t('authEyebrow')}</span>
            <h1 className="auth-title">
              {mode === 'login' ? t('authWelcomeBack') : t('authCreateTitle')}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login' ? t('authSubtitleLogin') : t('authSubtitleSignup')}
            </p>
          </div>

          <div className="auth-guest-hero">
            <button
              type="button"
              id="auth-guest-btn"
              className="btn btn--primary btn--full"
              onClick={handleContinueGuest}
              disabled={isSubmitting}
            >
              {t('authContinueGuest')}
            </button>
            <p className="auth-guest-note">{t('authGuestNote')}</p>
          </div>

          <div className="auth-divider">
            <span>{t('authOrDivider')}</span>
          </div>

          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              id="auth-tab-login"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tabs__btn ${mode === 'login' ? 'is-active' : ''}`}
              onClick={() => switchMode('login')}
              disabled={isSubmitting}
            >
              {t('authTabLogin')}
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`auth-tabs__btn ${mode === 'signup' ? 'is-active' : ''}`}
              onClick={() => switchMode('signup')}
              disabled={isSubmitting}
            >
              {t('authTabSignup')}
            </button>
          </div>

          <form className="stack-form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="auth-name-input">{t('authNameLabel')}</label>
                <input
                  id="auth-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('authNamePlaceholder')}
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-email-input">{t('authEmailLabel')}</label>
              <input
                id="auth-email-input"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('authEmailPlaceholder')}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            <div className="field">
              <label htmlFor="auth-password-input">{t('authPasswordLabel')}</label>
              <input
                id="auth-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('authPasswordPlaceholder')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={isSubmitting}
              />
            </div>

            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="auth-confirm-input">{t('authConfirmPasswordLabel')}</label>
                <input
                  id="auth-confirm-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('authConfirmPasswordPlaceholder')}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {notice && (
              <p id="auth-notice-msg" className="form-notice" role="status">
                {t(notice.key, notice.vars)}
              </p>
            )}

            {errorKey && (
              <p id="auth-error-msg" className="form-error" role="alert">
                {t(errorKey)}
              </p>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              className="btn btn--violet-outline btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === 'login'
                  ? t('authSubmittingLogin')
                  : t('authSubmittingSignup')
                : mode === 'login'
                ? t('authLoginBtn')
                : t('authSignupBtn')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
