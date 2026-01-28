// components/PrivateRoute.js
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';


const PrivateRoute = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    // console.log("private token", token)
    return token ? children : <Navigate to={`/`} />;
};

export default PrivateRoute;
