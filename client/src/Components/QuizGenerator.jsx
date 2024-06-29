import { useState } from "react";
import axios from "axios";

const QuizGenerator = ({ onQuizGenerated }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [fileOption, setFileOption] = useState(true);
  const [textLength, setTextLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  const [responseText, setResponseText] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "text/plain" ||
        selectedFile.type === "application/pdf")
    ) {
      setFile(selectedFile);
      setText("");
      setTextLength(0);
    } else {
      alert("Please select a valid text (.txt) or PDF (.pdf) file.");
    }
  };

  const handleTextPaste = (event) => {
    const pastedText = event.clipboardData.getData("Text");
    if (pastedText) {
      setText(pastedText);
      setTextLength(pastedText.length);
      setFile(null);
    }
  };

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    setTextLength(newText.length);
    setFile(null);
  };

  const toggleFileOption = () => {
    setFileOption(!fileOption);
    setFile(null);
    setText("");
    setTextLength(0);
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      if (file.type === "application/pdf") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (fileOption && file) {
        formData.append("file", file);
      } else if (!fileOption && text) {
        formData.append("content", text);
      } else {
        throw new Error("No content provided");
      }

      formData.append("difficulty", difficulty);
      formData.append("questionCount", questionCount);
      formData.append("questionType", questionType);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URI}/generate-quiz`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResponseText(response.data);
      onQuizGenerated(response.data);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setResponseText("An error occurred while generating the quiz.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full m-auto h-screen justify-center p-3 flex flex-col items-center gap-3">
      <div className="mb-3">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-base font-medium">
            Provide content to generate quiz
          </h1>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="uploadOption"
                checked={fileOption}
                onChange={toggleFileOption}
              />{" "}
              Upload File
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="uploadOption"
                checked={!fileOption}
                onChange={toggleFileOption}
              />{" "}
              Paste Text
            </label>
          </div>
          {fileOption ? (
            <input
              className="border rounded-xl shadow-2xl border-white/10 bg-white/5 p-3 file:rounded-md file:mr-3 file:border-0"
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileChange}
            />
          ) : (
            <textarea
              className="border w-96 rounded-xl shadow-2xl border-white/10 bg-white/5 p-3 file:rounded-md file:mr-3 file:border-0"
              placeholder="Paste your text here..."
              value={text}
              onChange={handleTextChange}
              onPaste={handleTextPaste}
            ></textarea>
          )}
          {fileOption && file && <p>Selected file: {file.name}</p>}
          {!fileOption && textLength > 0 && (
            <p>Text length: {textLength} characters</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border border-white/15 rounded-lg p-2"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="border border-white/15 rounded-lg p-2"
        >
          <option value={5}>5 Questions</option>
          <option value={10}>10 Questions</option>
        </select>

        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          className="border border-white/15 rounded-lg p-2"
        >
          <option value="mcq">MCQ Only</option>
        </select>
      </div>

      <button
        className="mt-4"
        onClick={handleClick}
        disabled={loading || (!file && !text)}
      >
        {loading ? "Generating Quiz..." : "Generate Quiz"}
      </button>
    </div>
  );
};

export default QuizGenerator;
