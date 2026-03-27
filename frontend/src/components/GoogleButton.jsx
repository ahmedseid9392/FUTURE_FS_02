import { useEffect, useRef } from 'react';
import API from '../services/api';

const GoogleButton = ({ onSuccess, onError, buttonText = "Sign in with Google" }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google && buttonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      window.google.accounts.id.renderButton(
        buttonRef.current,
        { 
          theme: 'outline',
          size: 'large',
          text: buttonText === "Sign in with Google" ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
          width: '100%'
        }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await API.post('/auth/google', {
        credential: response.credential
      });
      
      const { token, user } = res.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      onSuccess(user);
    } catch (error) {
      console.error('Google login error:', error);
      onError(error.response?.data?.message || 'Google authentication failed');
    }
  };

  return (
    <div ref={buttonRef} className="w-full"></div>
  );
};

export default GoogleButton;