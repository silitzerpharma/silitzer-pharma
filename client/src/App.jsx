import './App.css'
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import { login } from "./store/slices/UserSlice";
import { ToastContainer } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;



function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);  // <-- new loading state

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/checkuserlogin`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (res.ok) {
          dispatch(login(data.user));
        } else {
          // optionally logout or clear user state here
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);  // <-- loading done here
      }
    };

    checkLogin();
  }, [dispatch]);

  if (loading) return <div>Loading user info...</div>;  // <-- show loading screen

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
