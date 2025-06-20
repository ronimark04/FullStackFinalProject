import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Button,
} from "@heroui/react";
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/languageContext';

// Helper function to detect if text is mainly Hebrew
function isMainlyHebrew(text) {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF]/g;
    const hebrewChars = (text.match(hebrewPattern) || []).length;
    return hebrewChars > text.length * 0.5;
}

const translations = {
    signupTitle: { heb: 'הרשמה', eng: 'Sign Up' },
    signupSubtitle: { heb: 'צור חשבון חדש', eng: 'Create your account' },
    username: { heb: 'שם משתמש', eng: 'Username' },
    email: { heb: 'אימייל', eng: 'Email' },
    password: { heb: 'סיסמה', eng: 'Password' },
    confirmPassword: { heb: 'אימות סיסמה', eng: 'Confirm Password' },
    cancel: { heb: 'ביטול', eng: 'Cancel' },
    signup: { heb: 'הרשמה', eng: 'Sign Up' },
    passwordsNoMatch: { heb: 'הסיסמאות אינן תואמות', eng: 'Passwords do not match' },
    registrationFailed: { heb: 'ההרשמה נכשלה. נסה שוב.', eng: 'Registration failed. Please try again.' },
};

// Add styles from Contact.jsx
const formContainerStyle = {
    background: '#fff8e1',
    opacity: 0.85,
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    padding: 32,
    maxWidth: 540,
    width: '100%',
    margin: '40px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
};

const labelBaseStyle = {
    fontWeight: 600,
    color: '#5D4037',
    marginBottom: 1,
};

const inputStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 15,
    outline: 'none',
    marginBottom: 6,
};

const buttonStyle = {
    padding: '12px 0',
    borderRadius: 8,
    background: '#A15E0A',
    color: 'white',
    border: 'none',
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'background 0.2s',
    minWidth: 100,
};

export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError(translations.passwordsNoMatch[language]);
            setIsLoading(false);
            return;
        }

        try {
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            // Redirect to home page after successful registration
            navigate('/');
        } catch (err) {
            setError(err.message || translations.registrationFailed[language]);
        } finally {
            setIsLoading(false);
        }
    };

    // Set direction and text alignment based on language
    const dir = language === 'heb' ? 'rtl' : 'ltr';
    const textAlign = language === 'heb' ? 'right' : 'left';
    const labelStyle = language === 'heb' ? { ...labelBaseStyle, textAlign: 'right', direction: 'rtl' } : labelBaseStyle;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit} style={{ ...formContainerStyle, direction: dir, textAlign }}>
                <h2 style={{ color: '#A15E0A', fontWeight: 500, fontSize: 24, textAlign: 'center' }}>
                    {translations.signupTitle[language]}
                </h2>
                <p style={{ color: '#5D4037', marginBottom: 18, fontSize: 16, textAlign: 'center' }}>
                    {translations.signupSubtitle[language]}
                </p>
                {error && (
                    <div style={{ color: 'red', marginBottom: 12, fontWeight: 500, direction: dir, textAlign }}>{error}</div>
                )}
                <label style={labelStyle} htmlFor="username">{translations.username[language]}</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: isMainlyHebrew(formData.username) ? 'rtl' : 'ltr', textAlign: isMainlyHebrew(formData.username) ? 'right' : 'left' }}
                    required
                    disabled={isLoading}
                />
                <label style={labelStyle} htmlFor="email">{translations.email[language]}</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: dir, textAlign }}
                    required
                    disabled={isLoading}
                />
                <label style={labelStyle} htmlFor="password">{translations.password[language]}</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: dir, textAlign }}
                    required
                    disabled={isLoading}
                />
                <label style={labelStyle} htmlFor="confirmPassword">{translations.confirmPassword[language]}</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: dir, textAlign }}
                    required
                    disabled={isLoading}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                    <button
                        type="button"
                        style={{ ...buttonStyle, background: 'transparent', color: '#A15E0A', border: '1px solid #A15E0A' }}
                        onClick={() => navigate('/')}
                        disabled={isLoading}
                        onMouseOver={e => e.currentTarget.style.background = '#FFF3E0'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {translations.cancel[language]}
                    </button>
                    <button
                        type="submit"
                        style={buttonStyle}
                        disabled={isLoading}
                        onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                        onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                    >
                        {isLoading ? '...' : translations.signup[language]}
                    </button>
                </div>
            </form>
        </div>
    );
} 