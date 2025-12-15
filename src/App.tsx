import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PropertyListings } from '@/pages/PropertyListings'
import { PropertyDetails } from '@/pages/PropertyDetails'
import { OwnerUpload } from '@/pages/OwnerUpload'
import { OwnerDashboard } from '@/pages/OwnerDashboard'
import { OwnerEdit } from '@/pages/OwnerEdit'
import { Account } from '@/pages/Account'
import { Header } from '@/components/Header'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<PropertyListings />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/owner/upload" element={<OwnerUpload />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/edit/:id" element={<OwnerEdit />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  )
}

export default App
