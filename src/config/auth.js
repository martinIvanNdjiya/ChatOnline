import { auth } from "./firebase-config.js";
import { useContext } from "react";
import { tokenContext } from '../TokenContext.jsx';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updatePassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider, getAuth, signOut
} from "firebase/auth";


export const doCreateUserWithEmailAndPassword = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log(result.user);
    window.alert("Utilisateur créé");
    return result.user;
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user; // Corrected this line
        const token = await userCredential.user.getIdToken(); // Get the token if needed
        console.log("connexion réussie");
        return { user, token }; // Optionally return user and token
    } catch (error) {
        console.error(error.message);
        throw error; // Rethrow to handle it in the component
    }
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        // console.log(`Le jeton d'authentification: ${token}`);
        // console.log(user);
        console.log("connexion avec google reussi");


        // Return user information
        return { user, token };
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

export const doSignInWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log("connexion avec github reussi");


        // Return user information
        return { user, token };
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

export const doSignOut = async () => {
    try {
        await signOut(auth);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useContext(tokenContext).setToken({});
        window.alert("Vous êtes déconnecté");
    } catch (error) {
        console.error(error.message);
    }
};

export const doPasswordReset = async (email) => {
    return await sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = async (password) => {
    const user = auth.currentUser;
    if (user) {
        return await updatePassword(user, password);
    }
    throw new Error("No user is currently signed in.");
};
