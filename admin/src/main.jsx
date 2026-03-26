import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'primereact/resources/themes/lara-light-amber/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
