// App.jsx
import './App.css';

// Firebase and Firestore initialization (from firebase.js)
import './config/firebase-config.js'; // Assuming firebase.js is properly exported and available

// Components
import { NoPage } from './NoPage';
import { Chat } from './Chat.jsx';
import ProfileSetting from './GestionProfile.jsx'; // Import the new profile settings page
import CreationCompte from './CreationCompte.jsx';
import Connexion from './Connexion.jsx';

// React Router
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { tokenContext } from './TokenContext.jsx';
import PrivateRoute from './PrivateRoute.jsx';

function App() {
  // Definir un état local pour le jeton
  // placer la variable et la méthode de l'etat local dans un contexte
  const [token, setToken] = useState("")
  return (
    <tokenContext.Provider value={{ token, setToken }}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NoPage />} />
          <Route path="/" element={<Connexion />} />
          <Route path="/profile" element={<PrivateRoute><ProfileSetting /></PrivateRoute>} /> {/* Added route for profile settings */}
          <Route path="/Creation" element={<CreationCompte />} />
          <Route path="/Chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </tokenContext.Provider>
  );
}

export default App;
