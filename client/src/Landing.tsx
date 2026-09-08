import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// default landing page
export default function Landing() {

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dash');
    }
  }, [loading]);

  return (
    <>
      <h1>Landing</h1>
      <div className="content-main">
	<div className="message-container">Login or Register to continue</div>
      </div>
    </>
  );
}
