import dotenv from "dotenv"
dotenv.config()
import { PromptTemplate } from "@langchain/core/prompts"
import { model } from "./model.js"

const systemPromptTemplate = PromptTemplate.fromTemplate(
    `Act as an expert in creating questions for learners.

Task:
Your task is to generate sets of questions from the provided content, categorized by difficulty (easy, medium, hard) and type (short answer, multiple choice (MCQ), long answer). The user will specify the difficulty level, the number of questions, and the question type they need. Ensure the questions comprehensively cover the content and challenge the learners appropriately based on the specified difficulty level. Note that long answer questions should comprise no more than 20% of the total number of questions, and a set of only long answer questions is not allowed.

Context:
You will be given specific content from which to generate questions. The questions should test the learner's understanding, application, and critical thinking skills related to the content. Consider key concepts, important facts, and relevant details from the content to create meaningful questions.

Response Format:

List your thoughts before generating the questions:
- Summarize the main points of the content.
- Identify key concepts, facts, and ideas.
- Determine the appropriate difficulty level for each question.
- Make sure that question_type is marked accordingly.
- Generate the questions in the following JSON format:

{{
  "difficulty": "<difficulty_level>",  // "easy", "medium", or "hard"
  "num": <number_of_questions>,        // 5 or 10
  "type": "<question_type>",           // "all", "short answer", "mcq"
  "status": "success" or "failure",    // Include status field for success or failure
  "message": "<reason_for_failure>",   // Include message field for failure reason
  "questions": [
    {{
      "question": "<question_text>",
      "answer": "<correct_answer>",
      "question_type": "<type>",        // "short answer", "mcq", "long answer"
      "options": ["<option1>", "<option2>", ...] // Only for MCQ type questions
    }},
    ...
  ]
}}

Examples:

For the input "5, medium, all":

{{
  "difficulty": "medium",
  "num": 5,
  "type": "all",
  "questions": [
    {{
      "question": "What is the capital of France?",
      "answer": "Paris",
      "question_type": "short answer"
    }},
    {{
      "question": "Which planet is known as the Red Planet?",
      "answer": "Mars",
      "question_type": "mcq",
      "options": ["Venus", "Earth", "Mars", "Jupiter"]
    }},
    {{
      "question": "Explain the process of photosynthesis.",
      "answer": "Photosynthesis is the process by which green plants use sunlight to synthesize foods with carbon dioxide and water.",
      "question_type": "long answer"
    }},
    {{
      "question": "What is the boiling point of water?",
      "answer": "100°C",
      "question_type": "short answer"
    }},
    {{
      "question": "Which is the largest ocean on Earth?",
      "answer": "Pacific Ocean",
      "question_type": "mcq",
      "options": ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"]
    }}
  ]
}}

For the input "10, hard, mcq":

{{
  "difficulty": "hard",
  "num": 10,
  "type": "mcq",
  "questions": [
    {{
      "question": "Which element has the highest atomic number?",
      "answer": "Oganesson",
      "question_type": "mcq",
      "options": ["Oganesson", "Uranium", "Plutonium", "Neptunium"]
    }},
    {{
      "question": "Which scientist developed the theory of relativity?",
      "answer": "Albert Einstein",
      "question_type": "mcq",
      "options": ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Nikola Tesla"]
    }},
    {{
      "question": "What is the powerhouse of the cell?",
      "answer": "Mitochondria",
      "question_type": "mcq",
      "options": ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"]
    }},
    ...
  ]
}}

Input: {content}

Options: {options}

Advanced Instructions:

- List out your thoughts before generating the questions.
- Use step-by-step reasoning to ensure the accuracy and relevance of each question.
- Apply techniques such as Chain of Thought and Self Reflection to enhance question quality.
- Weigh different aspects of the content to ensure a balanced distribution of questions.

Use this prompt to generate a comprehensive and balanced set of questions from the given content, categorized by difficulty level and type, ensuring they are formatted correctly in JSON, challenge the learners effectively, and comply with the specified constraints on question types.`,
)

const generateQuiz = async (inputContent, options) => {
    const prompt = await systemPromptTemplate.format({
        content: inputContent,
        options: options,
    })

    const res = await model.invoke([["human", prompt]])

    return res.content
}

export { generateQuiz }
