import { Routes, Route } from "react-router-dom";
import Login from "./components/Homepage.jsx";
import Split from "./components/Split.jsx";
import People from "./components/People.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/split" element={<Split />} />
      <Route path="/people" element={<People />} />
    </Routes>
  );
}

export default App;