import React from 'react'
import Repo from './pages/Repo'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Home from './pages/Home'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/repo' element={<Repo/>} />
      </Routes>
    </Router>
  )
}

export default App