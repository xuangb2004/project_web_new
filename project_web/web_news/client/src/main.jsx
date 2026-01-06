import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from "./context/authContext"; // <--- Import cái này
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      {/* Thay CLIENT_ID của bạn vào đây */}
      <GoogleOAuthProvider clientId="381703409168-q0q86ghbf6nltk7vhv673forafj0tqbe.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </AuthContextProvider>
  </React.StrictMode>
);