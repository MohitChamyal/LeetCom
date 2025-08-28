import './NotFound.css'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved. Let's get you back to exploring amazing coding challenges!</p>
      <button onClick={() => window.location.href = '/'}>
        ← Go Home
      </button>
    </div>
  );
};

export default NotFound;
