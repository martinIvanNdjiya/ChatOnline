import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, storage, auth } from './config/firebase-config.js'; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; 
import './ProfileSetting.css';

function ProfileSetting() {
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    email: "",
    profilePicture: ""
  });
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // State to track authenticated user

  // 1️UseEffect to load user data from Firestore and show it in the form
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);  // Set authenticated user
        const docRef = doc(db, "User", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Set profile data with retrieved user details
          setProfile({
            name: `${userData.Nom} ${userData.Prenom}`,  // Combine Nom and Prenom for display
            bio: userData.bio || "",
            email: userData.Email || "",
            profilePicture: userData.profilePicture || ""
          });
        } else {
          console.log("No such document!");
        }
      } else {
        console.log("No user is signed in.");
        setUser(null); // If no user is signed in, reset the user state
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [auth]);

  //Handle file change for profile picture
  const handleFileChange = (e) => {
    setNewProfilePicture(e.target.files[0]);
  };

  //Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  //Upload profile picture to Firebase Storage and update Firestore
  const handleUploadProfilePicture = async () => {
    if (!newProfilePicture || !user) {
      alert("You must be signed in to upload a profile picture.");
      return;
    }

    const storageRef = ref(storage, `profile_pictures/${user.uid}/${newProfilePicture.name}`);
    try {
      await uploadBytes(storageRef, newProfilePicture); // Upload to Firebase Storage
      const downloadURL = await getDownloadURL(storageRef); // Get URL of uploaded image

      // Update profile picture URL in Firestore
      await updateDoc(doc(db, "User", user.uid), { profilePicture: downloadURL });
      setProfile((prev) => ({ ...prev, profilePicture: downloadURL }));
      setNewProfilePicture(null);  // Clear the new profile picture after upload
    } catch (error) {
      console.error("Error uploading profile picture: ", error);
    }
  };

  //Save profile changes to Firestore (excluding profile picture)
  const handleSaveProfile = async () => {
    if (!user) {
      console.error("No authenticated user found. Cannot save profile.");
      alert("You must be signed in to save your profile.");
      return;
    }

    setLoading(true);
    const profileDoc = doc(db, "User", user.uid);  // Reference to the Firestore document

    try {
      // Merge the new profile data without overwriting existing fields
      await updateDoc(profileDoc, {
        bio: profile.bio,
        Email: profile.email,  // Sync updated email
        Nom: profile.name.split(' ')[0], // Split name for 'Nom' (first part)
        Prenom: profile.name.split(' ')[1] || "" // Split name for 'Prenom' (second part)
      });

      setLoading(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      setLoading(false);
    }
  };

  //Delete profile picture from Firebase Storage and update Firestore
  const handleDeleteProfilePicture = async () => {
    if (!profile.profilePicture || !user) {
      alert("You must be signed in to delete your profile picture.");
      return;
    }

    const storageRef = ref(storage, profile.profilePicture);
    try {
      await deleteObject(storageRef); // Delete the file from Firebase Storage
      await updateDoc(doc(db, "User", user.uid), { profilePicture: "" }); // Clear the Firestore profilePicture field

      setProfile((prev) => ({ ...prev, profilePicture: "" }));  // Clear the state
      alert("Profile picture deleted successfully.");
    } catch (error) {
      console.error("Error deleting profile picture: ", error);
    }
  };

  //Logout function
  const handleLogOut = () => {
    signOut(auth).then(() => {
      console.log("User successfully logged out");
      setUser(null);  // Clear user state after logout
    }).catch((error) => {
      console.error("Error logging out", error);
    });
  };

  //Render the profile settings UI
  return (
    <>
      <h1 className="title is-1">Profile Settings</h1>

      <div className="profile-setting-container">
        <div className="profile-picture-section">
          <img
            src={profile.profilePicture || "default-avatar.png"}
            alt="Profile"
            className="profile-picture"
          />
          {profile.profilePicture && (
            <button className="delete-btn" onClick={handleDeleteProfilePicture}>
              Delete Profile Picture
            </button>
          )}
        </div>

        <div className="profile-info-section">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
          />
          <label>Bio:</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleInputChange}
          />
        </div>

        {/* File Upload Section */}
        <div className="file-upload-section">
          <label htmlFor="file-upload">Choose File:</label>
          <input type="file" id="file-upload" onChange={handleFileChange} />
          <button type="button" onClick={handleUploadProfilePicture}>
            Upload New Picture
          </button>
        </div>

        <button className="save-btn" onClick={handleSaveProfile} disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>

        <button type="button" onClick={handleLogOut}>
          Log Out
        </button>
      </div>
    </>
  );
}

export default ProfileSetting;
