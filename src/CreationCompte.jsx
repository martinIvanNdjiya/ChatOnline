import { useState } from "react";
import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "./config/firebase-config.js";
import { doCreateUserWithEmailAndPassword } from "./config/auth.js";
import { useNavigate } from "react-router-dom";


function CreationCompte() {
    const [NomInput, setNom] = useState("");
    const [PrenomInput, setPrenom] = useState("");
    const [emailInput, setemail] = useState("");
    const [motDePasseInput, setmotDePasse] = useState("");
    const [errorNom, setErrorN] = useState("");
    const [errorPrenom, setErrorP] = useState("");
    const [errorEmail, setErrorE] = useState("");
    const [errorMdp, setErrorM] = useState("");
    const navigate = useNavigate();

    function GoConnexion() {
        navigate("/")
    }

    async function addBd(uid, Nom, Prenom, email, motDePasse) {
        try {
            const userDocRef = doc(db, "User", uid);

            await setDoc(userDocRef, {
                Nom: Nom,
                Prenom: Prenom,
                Email: email,
                Password: motDePasse
            });
            console.log("User document successfully created with UID:", uid);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }

    async function add() {

        // Clear previous errors
        setErrorN('');
        setErrorP('');
        setErrorE('');
        setErrorM('');
        let hasErrors = false;
        // Validation checks
        if (NomInput.length < 1) {
            setErrorN("Le nom doit comporter au moins 1 caractère.");
            hasErrors = true;
        }
        if (PrenomInput.length < 1) {
            setErrorP("Le prénom doit comporter au moins 1 caractère.");
            hasErrors = true;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput)) {
            setErrorE("Veuillez entrer un email valide.");
            hasErrors = true;

        }

        // Password validation with regex
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/; // At least 6 characters, one uppercase, one lowercase, one special character
        if (!passwordRegex.test(motDePasseInput)) {
            setErrorM("Le mot de passe doit comporter au moins 6 caractères, une lettre majuscule, une lettre minuscule et un caractère spécial.");
            hasErrors = true;

        }
        if (hasErrors) {
            return;
        }
        try {
            const userCredential = await doCreateUserWithEmailAndPassword(emailInput, motDePasseInput);

            const uid = userCredential.uid;

            await addBd(uid, NomInput, PrenomInput, emailInput, motDePasseInput);
            GoConnexion();
        } catch (error) {
            console.error("Error creating user: ", error);
        }
    }
    /*     async function connecter() {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, emailInput, motDePasseInput)
            .then((userCredential) => { 
                const user = userCredential.user;
                window.alert(`vous etes connecter ${emailInput}`)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
          
    } */

    /*     async function update() {
        const auth = getAuth();
        const user=auth.currentUser
        if (user) {
            updateEmail(auth.currentUser,Emailchanger).then(() => {
                window.alert("email mis à jour");
              }).catch((error) => {
                console.log(error)
              });
          updatePassword(auth.currentUser,MDPchanger)
                .then(() => {
                    window.alert("Mot de passe mis à jour");
                })
                .catch((error) => {
                    console.log("Erreur lors de la mise à jour du mot de passe:", error);
                });
        }
    } */



    return (
        <>
            <div className="container">
                <h1 className="title is-1">Création de profil</h1>
                <form className="box">
                    <div className="field is-flex is-align-items-center">
                        <div className="control mr-4">
                            {errorNom && <p className="help is-danger">{errorNom}</p>}
                            <label className="label">Nom</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Entrez votre nom"
                                onChange={(e) => setNom(e.target.value)}
                                value={NomInput} style={{ width: "200px" }}
                            />

                        </div>

                        <div className="control">
                            {errorPrenom && <p className="help is-danger">{errorPrenom}</p>}
                            <label className="label">Prénom</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Entrez votre prénom"
                                onChange={(e) => setPrenom(e.target.value)}
                                value={PrenomInput} style={{ width: "200px" }}
                            />
                        </div>
                    </div>

                    <div className="field">
                        {errorEmail && <p className="help is-danger">{errorEmail}</p>}
                        <label className="label">Email</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="Entrez votre email"
                            onChange={(e) => setemail(e.target.value)}
                            value={emailInput}
                        />

                    </div>


                    <div className="field">
                        {errorMdp && <p className="help is-danger">{errorMdp}</p>}
                        <label className="label">Mot de Passe</label>
                        <div className="control">
                            <input
                                className="input"
                                type="password"
                                placeholder="Entrez votre mot de passe"
                                onChange={(e) => setmotDePasse(e.target.value)}
                                value={motDePasseInput}
                            />
                        </div>
                    </div>

                    <div className="field is-grouped">
                        <div className="control">
                            <button className="button is-primary" type="button" onClick={add}>Créer Profil</button>
                        </div>
                        <button
                            className="button is-info"
                            type="button"
                            onClick={GoConnexion}>
                            Connexion
                        </button>
                    </div>
                </form>
            </div>

        </>
    );
}

export default CreationCompte;
