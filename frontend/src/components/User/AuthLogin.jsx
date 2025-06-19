import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GithubLoginFinish = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/clusterInfo', {
      state: {
        type: 'info',
        duration: 3,
      },
    });
  }, [navigate]);

  return null;
};

export default GithubLoginFinish;
