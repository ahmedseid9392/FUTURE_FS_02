import { useEffect, useRef } from 'react';
import API from '../services/api';

const GoogleButton = ({ onSuccess, onError, buttonText = "Sign in with Google" }) => {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const initializeGoogleButton = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        console.log('Waiting for Google Identity Services to load...');
        setTimeout(initializeGoogleButton, 500);
        return;
      }
      
      if (initializedRef.current) return;
      initializedRef.current = true;
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.error('VITE_GOOGLE_CLIENT_ID is not set');
        if (onError) onError('Google Sign-In is not configured');
        return;
      }
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup'
      });
      
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(
          buttonRef.current,
          { 
            theme: 'outline',
            size: 'large',
            text: buttonText === "Sign in with Google" ? 'signin_with' : 'signup_with',
            shape: 'rectangular',
            width: '100%',
            logo_alignment: 'center'
          }
        );
      }
    };
    
    initializeGoogleButton();
    
    return () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          console.log('Error canceling Google Sign-In:', e);
        }
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      console.log('Google response received');
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }
      
      const res = await API.post('/auth/google', {
        credential: response.credential
      });
      
      const { token, user } = res.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      console.log('Google login successful, user:', user.email);
      
      // Call the onSuccess callback with user data
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) {
        onError(error.response?.data?.message || error.message || 'Google authentication failed');
      }
    }
  };

  return (
    <div ref={buttonRef} className="w-full min-h-[40px]"></div>
  );
};

export default GoogleButton;