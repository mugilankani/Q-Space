import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import QuizManager from "./Components/Quiz";

const App = () => {
  return (
    <Router>
      <div className="flex w-full divide-x divide-white/10">
        <Routes>
          <Route path="/" element={<QuizManager />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
