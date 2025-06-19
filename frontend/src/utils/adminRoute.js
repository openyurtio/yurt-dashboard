import { Navigate } from 'react-router-dom';
import { useUserProfile } from './hooks';

// Routing page accessible only by administrators
const AdminRoute = ({ children }) => {

  const userProfile = useUserProfile()

  if (!userProfile || userProfile.metadata.name !== 'admin') {
    return <Navigate to="/clusterInfo" replace />;
  }

  return children;
};

export default AdminRoute;
