import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CreateMemoryBook from './pages/CreateMemoryBook';
import CreatePages from './pages/CreatePages';
import MemoryPreview from './pages/MemoryPreview';
import MemoryGallery from './pages/MemoryGallery';
import Contribute from './pages/Contribute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateMemoryBook />} />
        <Route path="/pages" element={<CreatePages />} />
        <Route path="/gallery" element={<MemoryGallery />} />
        <Route path="/preview" element={<MemoryPreview />} />
        <Route path="/contribute/:id" element={<Contribute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
