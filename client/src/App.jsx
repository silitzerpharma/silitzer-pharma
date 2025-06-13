import './App.css'
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import { login } from "./store/slices/UserSlice";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);  // <-- new loading state

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('http://localhost:3000/auth/checkuserlogin', {
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
    </BrowserRouter>
  );
}

export default App;
