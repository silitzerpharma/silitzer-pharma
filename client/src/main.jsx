import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'react-toastify/dist/ReactToastify.css';
import { store }  from './store/store.js';
import { Provider } from 'react-redux';


createRoot(document.getElementById('root')).render(

   <Provider store={store}>
    <App />
   </Provider>
  

)
