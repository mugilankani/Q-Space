import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import QuizGenerator from "./QuizGenerator";
import Chat from "./Chat";
import { markdownToTxt } from "markdown-to-txt";

const QuizManager = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [report, setReport] = useState({ correct: [], incorrect: [] });
  const [shortAnswers, setShortAnswers] = useState([]);
  const [feedback, setFeedback] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (quizData) {
      setUserAnswers(Array(quizData.questions.length).fill(""));
      setShortAnswers(
        quizData.questions.filter((q) => q.question_type === "short answer")
      );
    }
    if (score !== null) {
      const getReport = async () => {
        let incorrectString = ""; // Initialize an empty string

        for (let i = 0; i < report.incorrect.length; i++) {
          const item = report.incorrect[i];
          incorrectString += `Question: ${item.question} Correct Answer: ${item.correctAnswer} Your Answer: ${item.userAnswer}`;
        }
        await fetch("http://localhost:3000/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context: incorrectString,
          }),
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            setFeedback(data);
            console.log(data);
          })
          .catch((error) => {
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          });
      };
      getReport();
    }
  }, [quizData, score]);

  const handleQuizGenerated = (data) => {
    const sortedQuestions = [...data.questions].sort((a, b) =>
      a.question_type === "short answer" ? -1 : 1
    );
    setQuizData({ ...data, questions: sortedQuestions });
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const handlePrev = () => {
    setCurrentQuestion(Math.max(0, currentQuestion - 1));
  };

  const handleNext = () => {
    setCurrentQuestion(
      Math.min(quizData.questions.length - 1, currentQuestion + 1)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newReport = { correct: [], incorrect: [] };
    let correctCount = 0;

    quizData.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect =
        question.question_type === "mcq"
          ? userAnswer === question.answer
          : userAnswer.toLowerCase().includes(question.answer.toLowerCase());

      if (isCorrect) {
        correctCount++;
        newReport.correct.push({
          question: question.question,
          answer: question.answer,
        });
      } else {
        newReport.incorrect.push({
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: question.answer,
        });
      }
    });

    setScore(correctCount);
    setReport(newReport);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const feedbackText = feedback && feedback.text;

  // Convert Markdown to plain text using markdown-to-txt
  const plainTextFeedback = feedbackText ? markdownToTxt(feedbackText) : "";

  // Render the plain text feedback

  if (!quizData) {
    return <QuizGenerator onQuizGenerated={handleQuizGenerated} />;
  }

  const currentQuestionData = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <div className="flex-1 flex flex-col p-8">
        <div className="flex justify-between items-center pb-8">
          <h1 className="text-4xl font-bold text-white">Q Space</h1>
          <div className="font-medium h-fit bg-white/10 text-white px-6 text-sm py-1.5 rounded-full">
            Difficulty:{" "}
            <span className="capitalize font-semibold">
              {quizData.difficulty}
            </span>
          </div>
        </div>
        {score === null ? (
          <>
            <div className="mb-8 px-6 py-8 bg-black/50 rounded-md">
              <h2 className="text-xl font-semibold mb-4 text-white">
                {currentQuestionData.question}
              </h2>
              {currentQuestionData.question_type === "mcq" ? (
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestionData.options.map((option, index) => (
                    <motion.button
                      key={index}
                      className={`p-4 border-1 border-white/20 text-base font-medium ${
                        userAnswers[currentQuestion] === option
                          ? "bg-black border-white border-2"
                          : "bg-white/5"
                      } text-white`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="w-full py-2 px-4 border-2 border-white/20 rounded-md text-lg font-medium bg-black/50 text-white"
                  value={userAnswers[currentQuestion]}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
            <div className="flex justify-between mt-auto">
              <motion.button
                className="px-6 py-2 flex h-fit pl-4 gap-1 items-center bg-black/30 border border-white/20 rounded-full text-white font-medium cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handlePrev}
                disabled={currentQuestion === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-chevron-left"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Prev
              </motion.button>
              {currentQuestion === quizData.questions.length - 1 ? (
                <motion.button
                  className="px-7 py-2 bg-indigo-600 text-white font-medium border border-indigo-950 rounded-full cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmit}
                >
                  Submit
                </motion.button>
              ) : (
                <motion.button
                  className="py-2 flex h-fit pl-7 pr-3 gap-1 items-center bg-black/30 border border-white/20  rounded-full text-white font-medium cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleNext}
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-chevron-right"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </motion.button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-center border-t border-white/10 pt-12 pb-14">
              <h2 className="text-3xl font-bold mb-3 text-white">
                Quiz Completed! ✅
              </h2>
              <p className="text-xl text-white/75">
                Your score: <span className="text-white">{score}</span>/
                <span className="text-white">{quizData.questions.length}</span>
              </p>
              <h3 className="text-3xl font-bold mt-8 mb-4 text-white border-t border-white/10 pt-10">
                Report 📃
              </h3>
              <div className="text-left w-full">
                <h4 className="text-lg font-medium mb-2 text-white">
                  Correct Answers👍:
                </h4>
                {report.correct.map((item, index) => (
                  <p key={index} className="text-white">
                    {item.question} - {item.answer}
                  </p>
                ))}
                <h4 className="text-lg font-medium mt-4 mb-2 text-white">
                  Incorrect Answers❌:
                </h4>
                {report.incorrect.map((item, index) => (
                  <p key={index} className="text-white">
                    {item.question} - Your answer: {item.userAnswer}, Correct
                    answer: {item.correctAnswer}
                  </p>
                ))}
              </div>
              <h2 className="text-2xl font-semibold text-white pt-10 pb-5 text-left">
                Feedback👏
              </h2>
              <p className="text-white w-fit text-left">{plainTextFeedback}</p>
            </div>
            <Chat />
          </>
        )}
      </div>
      {!submitted && (
        <div className="bg-white/5 text-white px-8 py-4 flex justify-between items-center">
          <span className="font-medium">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </span>
          {isSubmitting && (
            <div className="w-64 h-2 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizManager;
