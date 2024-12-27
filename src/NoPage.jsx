import { Link } from "react-router-dom";

export function NoPage() {
    return (
        <div className="error-page-container">
            <h1 className="error-title">404</h1>
            <p className="error-message">{"Oops! The page you're looking for doesn't exist."}</p>
            <Link to="/" className="home-link">Go Back to Home</Link>
        </div>
    );
}
