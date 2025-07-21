import { Box } from '@mui/material'
import React from 'react'
import 'react-horizontal-scrolling-menu/dist/styles.css';

import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import ExerciseDitail from './Pages/ExerciseDitail'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'

export default function App() {
  return (
    <Box width='400px' sx={{width:{xl:'1488px'}}} m='auto'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/exercise/:id' element={<ExerciseDitail/>}/>
      </Routes>
      <Footer/>
      
    </Box>
  )
}
