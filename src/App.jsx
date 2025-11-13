import React, { useState, useEffect, useCallback, useRef } from 'react'
import MediaFetcher from './components/MediaFetcher'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <MediaFetcher />
    </div>
  )
}

export default App

