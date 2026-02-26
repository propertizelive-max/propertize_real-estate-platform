import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import UserLayout from './layouts/UserLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Rent from './pages/Rent'
import Resale from './pages/Resale'
import PropertyDetailView from './pages/PropertyDetailView'
import Compare from './pages/Compare'
import Search from './pages/Search'
import BookAppointment from './pages/BookAppointment'
import Profile from './pages/Profile'
import Dashboard from './pages/admin/Dashboard'
import AddProperty from './pages/admin/AddProperty'
import ScheduledTours from './pages/admin/ScheduledTours'
import AppointmentDetail from './pages/admin/AppointmentDetail'
import Settings from './pages/admin/Settings'
import PropertiesList from './pages/admin/PropertiesList'
import PropertyDetail from './pages/admin/PropertyDetail'
import Amenities from './pages/admin/Amenities'
import PropertyTypes from './pages/admin/PropertyTypes'
import Compressions from './pages/admin/Compressions'
import PropertyVideos from './pages/admin/PropertyVideos'

export default function App() {
  return (
    <Routes>
      {/* Public / user-facing area */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="rent" element={<Rent />} />
        <Route path="resale" element={<Resale />} />
        <Route path="property/:id" element={<PropertyDetailView />} />
        <Route path="property/:id/appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="compare" element={<Compare />} />
        <Route path="search" element={<Search />} />
      </Route>

      {/* Auth routes (shared login for now) */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />

      {/* Admin area */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="properties" element={<PropertiesList />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="scheduled-tours" element={<ScheduledTours />} />
        <Route path="scheduled-tours/:id" element={<AppointmentDetail />} />
        <Route path="property-videos" element={<PropertyVideos />} />
        <Route path="compressions" element={<Compressions />} />
        <Route path="amenities" element={<Amenities />} />
        <Route path="property-types" element={<PropertyTypes />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
