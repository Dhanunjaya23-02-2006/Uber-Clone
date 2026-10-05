import { useNavigate } from 'react-router-dom';
import { CaptainDataContext } from '../context/CaptianContext';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';

const CaptainProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/captain-login');
      return;
    }

    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        setCaptain(response.data.captian);
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('Failed to load captain profile:', error);
      localStorage.removeItem('token');
      navigate('/captain-login');
    });
  }, [token, navigate, setCaptain]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return children;
};

export default CaptainProtectedWrapper;