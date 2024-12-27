import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { collection, addDoc, query, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db, auth, storage } from "./config/firebase-config"
import { useEffect, useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import "./Chat.css"
import { doSignOut } from "./config/auth.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function Chat() {
    const [messages, setMessages] = useState([]);
    const [messagesText, setMessagesText] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uid, setUid] = useState(null);
    const messagesCollectionRef = collection(db, "messages");
    const usersCollectionRef = collection(db, "User");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUid(user.uid);
            } else {
                setUid(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const storageRef = ref(storage, `uploads/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at', downloadURL);

            // Store the downloadURL in Firestore as a message
            await addDoc(messagesCollectionRef, {
                authorId: uid,
                text: '',
                fileUrl: downloadURL,
                sentAt: new Date(),
            });
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    const handleMessageSent = async () => {
        if (!messagesText.trim() || !uid) return;
        console.log(uid);

        await addDoc(messagesCollectionRef, {
            authorId: uid,
            text: messagesText,
            fileUrl: null,
            sentAt: new Date(),
        });
        setMessagesText('');
    }

    const retrieveUserDisplayName = async (uid) => {
        const docRef = doc(usersCollectionRef, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return `${data.Prenom} ${data.Nom}`;
        } else {
            console.log("No such document!");
            return "Unknown User";
        }
    };

    const onEmojiClick = (emojiObject) => {
        setMessagesText(prev => prev + emojiObject.emoji); // Append selected emoji
        setShowEmojiPicker(false); // Hide the emoji picker after selection
    };

    const isImageLink = (url) => {
        const imageRegex = /\.(png|jpe?g|gif|bmp|webp)(\?.*)?$/i;
        return imageRegex.test(url);
    };

    useEffect(() => {
        const q = query(messagesCollectionRef, orderBy("sentAt", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchMessages = async () => {
                const messagesPromises = querySnapshot.docs.map(async (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        console.log(data, data.authorId);

                        const displayName = await retrieveUserDisplayName(data.authorId);
                        return { text: data.text, displayName, sentAt: data.sentAt, authorId: data.authorId, fileUrl: data.fileUrl };
                    }
                    return null;
                });

                const resolvedMessages = await Promise.all(messagesPromises);
                setMessages(resolvedMessages.filter(Boolean));
            };

            fetchMessages().catch((error) => {
                console.error("Error fetching messages: ", error);
            });
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <>
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="logo">
                        <h1>ChatApp</h1>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#">Account</a></li>
                        <li><a href="/" onClick={doSignOut}>Logout</a></li>
                        <li><a href="/profile">Profile Setting</a></li>
                    </ul>
                </div>
            </nav>

            {/* Chat Container */}
            <div className="chat-container">
                <div className="messages" id="messages">
                    {/* Messages */}
                    {messages.map((msg, index) => {
                        // console.log(`Message Author ID: ${msg.authorId}, Current User ID: ${uid}`);
                        // console.log(`File URL: ${msg.fileUrl}, isImageLink: ${isImageLink(msg.fileUrl)}`);

                        const messageClass = msg.authorId === uid ? 'current-user' : 'other-user';
                        const decodedUrl = decodeURIComponent(msg.fileUrl);
                        return (
                            <div className={`message ${messageClass}`} key={index}>
                                <strong>{msg.displayName}:</strong>
                                {msg.text != "" && (<><br />{msg.text}</>)}
                                {msg.fileUrl && (
                                    <div>
                                        {isImageLink(msg.fileUrl) ? (
                                            <a href={msg.fileUrl} download={decodedUrl.split('/').pop().split('?')[0]}>
                                                <img src={msg.fileUrl} alt="Uploaded file" style={{ maxWidth: '100%' }} />
                                            </a>
                                        ) : (
                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                {decodedUrl.split('/').pop().split('?')[0]}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="chat-input">
                    <input
                        type="file"
                        id="file-upload"
                        accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }} // Hide the file input
                    />
                    <button
                        className="upload-button"
                        onClick={() => document.getElementById('file-upload').click()} // Trigger file input
                    >
                        <FontAwesomeIcon icon={faCirclePlus} />
                    </button>
                    <button
                        className="emoji-button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)} // Toggle emoji picker
                    >
                        😊
                    </button>
                    {showEmojiPicker && (
                        <div className="emoji-picker">
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                    )}
                    <input type="text" id="chatInput" placeholder="Type a message..." value={messagesText} onChange={(e) => { setMessagesText(e.target.value) }} />
                    <button id="sendBtn"
                        onClick={handleMessageSent}
                    >Send</button>
                </div>
            </div>
        </>
    );
}
