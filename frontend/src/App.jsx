import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FindDonors from "./pages/FindDonors";
import Profile from "./pages/Profile";
import Chats from "./pages/Chats";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/find-donors" element={<FindDonors />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/:chatId" element={<Chats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
