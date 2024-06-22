import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuizGenerator from './QuizGenerator';

const QuizManager = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [report, setReport] = useState({ correct: [], incorrect: [] });
  const [shortAnswers, setShortAnswers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (quizData) {
      setUserAnswers(Array(quizData.questions.length).fill(''));
      setShortAnswers(quizData.questions.filter(q => q.question_type === 'short answer'));
    }
  }, [quizData]);

  const handleQuizGenerated = (data) => {
    const sortedQuestions = [...data.questions].sort((a, b) => 
      a.question_type === 'short answer' ? -1 : 1
    );
    setQuizData({...data, questions: sortedQuestions});
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
    setCurrentQuestion(Math.min(quizData.questions.length - 1, currentQuestion + 1));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newReport = { correct: [], incorrect: [] };
      let correctCount = 0;

      quizData.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = question.question_type === 'mcq' 
          ? userAnswer === question.answer
          : userAnswer.toLowerCase().includes(question.answer.toLowerCase());

        if (isCorrect) {
          correctCount++;
          newReport.correct.push({ question: question.question, answer: question.answer });
        } else {
          newReport.incorrect.push({
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.answer
          });
        }
      });

      setScore(correctCount);
      setReport(newReport);
      setIsSubmitting(false);
    }, 10000);
  };

  if (!quizData) {
    return <QuizGenerator onQuizGenerated={handleQuizGenerated} />;
  }

  const currentQuestionData = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#FBF4E2] flex flex-col w-full relative">
      <div className="absolute top-4 right-4 bg-[#5C6CFF] text-[#FBF4E2] px-4 py-2 rounded-full">
        Difficulty: {quizData.difficulty}
      </div>
      <div className="flex-1 flex flex-col p-8">
        <h1 className="text-4xl font-bold mb-8 text-[#5C6CFF]">Quiz App</h1>
        {score === null ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#5C6CFF]">{currentQuestionData.question}</h2>
              {currentQuestionData.question_type === 'mcq' ? (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestionData.options.map((option, index) => (
                    <motion.button
                      key={index}
                      className={`p-4 border-4 border-[#5C6CFF] text-lg font-bold ${
                        userAnswers[currentQuestion] === option ? 'bg-[#FBADFB]' : 'bg-[#DFF555]'
                      } text-[#5C6CFF]`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="w-full p-4 border-4 border-[#5C6CFF] text-lg font-bold bg-[#DFF555] text-[#5C6CFF]"
                  value={userAnswers[currentQuestion]}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
            <div className="flex justify-between mt-auto">
              <motion.button
                className="px-6 py-2 bg-[#5C6CFF] text-[#FBF4E2] font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                disabled={currentQuestion === 0}
              >
                Prev
              </motion.button>
              {currentQuestion === quizData.questions.length - 1 ? (
                <motion.button
                  className="px-6 py-2 bg-[#5C6CFF] text-[#FBF4E2] font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                >
                  Submit
                </motion.button>
              ) : (
                <motion.button
                  className="px-6 py-2 bg-[#5C6CFF] text-[#FBF4E2] font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                >
                  Next
                </motion.button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#5C6CFF]">Quiz Completed!</h2>
            <p className="text-xl text-[#5C6CFF]">Your score: {score} out of {quizData.questions.length}</p>
            <h3 className="text-2xl font-bold mt-8 mb-4 text-[#5C6CFF]">Report</h3>
            <div className="text-left">
              <h4 className="text-xl font-semibold mb-2 text-[#5C6CFF]">Correct Answers:</h4>
              {report.correct.map((item, index) => (
                <p key={index} className="text-[#5C6CFF]">{item.question} - {item.answer}</p>
              ))}
              <h4 className="text-xl font-semibold mt-4 mb-2 text-[#5C6CFF]">Incorrect Answers:</h4>
              {report.incorrect.map((item, index) => (
                <p key={index} className="text-[#5C6CFF]">
                  {item.question} - Your answer: {item.userAnswer}, Correct answer: {item.correctAnswer}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-[#5C6CFF] text-[#FBF4E2] p-4 flex justify-between items-center">
        <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
        {isSubmitting && (
          <div className="w-64 h-4 bg-[#FBF4E2] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FBADFB]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 10 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManager;