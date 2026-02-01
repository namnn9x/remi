import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MemoryBookProvider } from './contexts/MemoryBookContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePages from './pages/CreatePages';
import MemoryPreview from './pages/MemoryPreview';
import MemoryGallery from './pages/MemoryGallery';
import Contribute from './pages/Contribute';
import MyMemoryBooks from './pages/MyMemoryBooks';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MemoryBookProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contribute/:id" element={<Contribute />} />
            <Route path="/view/:shareId" element={<MemoryPreview />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MyMemoryBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pages"
              element={
                <ProtectedRoute>
                  <CreatePages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gallery"
              element={
                <ProtectedRoute>
                  <MemoryGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-books"
              element={
                <ProtectedRoute>
                  <MyMemoryBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preview"
              element={
                <ProtectedRoute>
                  <MemoryPreview />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryBookProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
