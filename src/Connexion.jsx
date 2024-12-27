import { useState } from "react";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doSignInWithGitHub } from './config/auth.js';
import './Connexion.css';
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config/firebase-config.js";
import { tokenContext } from "./TokenContext.jsx";
import { useContext } from "react";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";

function Connexion() {
    const [emailInput, setEmail] = useState("");
    const [motDePasseInput, setMotDePasse] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const navigate = useNavigate();
    const { setToken } = useContext(tokenContext);

    const goChat = () => {
        navigate("/Chat");
    };

    const goCreationCompte = () => {
        navigate("/Creation");
    };

    const handleUserDocument = async (user) => {
        const userDocRef = doc(collection(db, "User"), user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            const [firstName, ...lastNameParts] = user.displayName.split(' ');
            await setDoc(userDocRef, {
                Nom: lastNameParts.join(' ') || '',
                Prenom: firstName || '',
                Email: user.email,
            });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                const { user, token } = await doSignInWithEmailAndPassword(emailInput, motDePasseInput);
                // Update token context
                setToken(token);
                await handleUserDocument(user);
                goChat();
            } catch {
                setIsSigningIn(false);
                // Handle error (e.g., show an error message)
            }
        }
    };

    // const onGoogleSignIn = async (e) => {
    //     e.preventDefault();
    //     if (!isSigningIn) {
    //         setIsSigningIn(true);
    //         try {
    //             await doSignInWithGoogle();
    //             goChat();
    //         } catch {
    //             setIsSigningIn(false);
    //             // Handle error
    //         }
    //     }
    // };

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                const { user, token } = await doSignInWithGoogle();
                // Update token context
                setToken(token);
                await handleUserDocument(user);

                goChat();
            } catch (error) {
                setIsSigningIn(false);
                console.error("Error during Google sign-in: ", error);
                // Handle error
            }
        }
    };

    const onGitHubSignIn = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            const authInstance = getAuth();
            try {
                const { user, token } = await doSignInWithGitHub();
                // Update token context
                setToken(token);
                await handleUserDocument(user);
                goChat();
            } catch(error) {
                setIsSigningIn(false);
                if (error.code === 'auth/account-exists-with-different-credential') {
                    const methods = await fetchSignInMethodsForEmail(authInstance, emailInput);
                    alert(`This email is linked with one of the following providers: ${methods.join(', ')}`);
                    // Optionally, navigate the user or show a prompt
                } else {
                    // Handle other errors
                    console.error("Error during sign in:", error.message);
                }
            }
        }
    };

    return (
        <div className="container">
            <h1 className="title is-1">Connexion</h1>
            <form className="box" onSubmit={onSubmit}>
                <div className="field">
                    <label className="label">Email</label>
                    <div className="control">
                        <input
                            className="input"
                            type="email"
                            placeholder="Entrez votre email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={emailInput}
                        />
                    </div>
                </div>

                <div className="field">
                    <label className="label">Mot de Passe</label>
                    <div className="control">
                        <input
                            className="input"
                            type="password"
                            placeholder="Entrez votre mot de passe"
                            onChange={(e) => setMotDePasse(e.target.value)}
                            value={motDePasseInput}
                        />
                    </div>
                </div>
                <div className="field is-grouped">
                    <div className="control">
                        <button
                            className="button is-primary"
                            type="submit"
                            disabled={isSigningIn}>
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                        <button
                            className="button is-light google-btn"
                            type="button"
                            disabled={isSigningIn}
                            onClick={onGoogleSignIn}>
                            {isSigningIn ? 'Signing In...' : 'Continue with Google'}
                        </button>
                        <button
                            className="button is-light"
                            type="button"
                            disabled={isSigningIn}
                            onClick={onGitHubSignIn}>
                            {isSigningIn ? 'Signing In...' : 'Continue with GitHub'}
                        </button>
                        <button
                            className="button is-info"
                            type="button"
                            onClick={goCreationCompte}>
                            Créer compte
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Connexion;
