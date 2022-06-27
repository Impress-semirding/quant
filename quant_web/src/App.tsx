import { useRoutes } from "react-router-dom";
import 'antd/dist/antd.css';

import routes from './routes';
import './App.css'

function App() {
  const element = useRoutes(routes)

  return (
    <div className="App">
      {element}
    </div>
  )
}

export default App
