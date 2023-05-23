import React from 'react'
import { Route, Routes } from 'react-router-dom'
import View from './View'
import { Header } from './components/Header'
import ScrollToTop from './components/ScrollToTop'

export function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route
          path="/"
          element={<View />}
        />
        <Route
          path="/game/:shortName"
          element={<View />}
        />
        <Route
          path="/game/:shortName/play"
          element={<View play />}
        />
      </Routes>
    </>
  )
}
