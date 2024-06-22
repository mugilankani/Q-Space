import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import History from "./Components/History";
import "./App.css";
import QuizManager from "./Components/Quiz";

const App = () => {
  return (
    <Router>
      <div className="flex w-screen divide-x divide-white/10">
        <History />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<QuizManager />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;