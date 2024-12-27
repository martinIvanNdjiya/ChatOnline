import { Navigate } from "react-router-dom";
import { auth } from './config/firebase-config';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        ); // Show loading spinner while checking auth state
    }

    if (!user) {
        // Redirect to login if not logged in
        return <Navigate to="/" />;
    }

    // Render children if logged in
    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired, // Validate children as required React node
};

export default PrivateRoute;
