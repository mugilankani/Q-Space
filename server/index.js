import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { PromptTemplate } from "@langchain/core/prompts";


const systemPromptTemplate = PromptTemplate.fromTemplate(
  `Act as an expert in creating questions for learners.
  
  Task:
  Your task is to generate sets of questions from the provided content, categorized by difficulty (easy, medium, hard) and type (short answer, multiple choice (MCQ), long answer). The user will specify the difficulty level, the number of questions, and the question type they need. Ensure the questions comprehensively cover the content and challenge the learners appropriately based on the specified difficulty level. Note that long answer questions should comprise no more than 20% of the total number of questions, and a set of only long answer questions is not allowed.
  
  Context:
  You will be given specific content, from which you need to generate questions. The questions should test the learner's understanding, application, and critical thinking skills related to the content. Consider key concepts, important facts, and relevant details from the content to create meaningful questions.
  
  Response Format:
  
  List your thoughts before generating the questions:
  Summarize the main points of the content.
  Identify key concepts, facts, and ideas.
  Determine the appropriate difficulty level for each question.
  Generate the questions in the following JSON format:
  
  {{
    "difficulty": "<difficulty_level>",  // "easy", "medium", or "hard"
    "num": <number_of_questions>,        // 5, 10
    "type": "<question_type>",          // "all", "short answer", "mcq"
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
  
  List out your thoughts before generating the questions.
  Use step-by-step reasoning to ensure the accuracy and relevance of each question.
  Apply techniques such as Chain of Thought and Self Reflection to enhance question quality.
  Weigh different aspects of the content to ensure a balanced distribution of questions.
  Use this prompt to generate a comprehensive and balanced set of questions from the given content, categorized by difficulty level and type, ensuring they are formatted correctly in JSON, challenge the learners effectively, and comply with the specified constraints on question types.`
);

// Initialize the Google GenAI Model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
  maxOutputTokens: 1000000,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
});

const inputContent = `World War I[j] or the First World War (28 July 1914 – 11 November 1918) was a global conflict between two coalitions: the Allies (or Entente) and the Central Powers. Fighting took place mainly in Europe and the Middle East, as well as parts of Africa and the Asia-Pacific, and was characterised by trench warfare and the use of artillery, machine guns, and chemical weapons (gas). World War I was one of the deadliest conflicts in history, resulting in an estimated 9 million military dead and 23 million wounded, plus up to 8 million civilian deaths from causes including genocide. The movement of large numbers of troops and civilians was a major factor in spreading the Spanish flu pandemic. The causes of World War I included the rise of Germany and decline of the Ottoman Empire, which disturbed the balance of power in place in Europe for most of the 19th century, as well as increased economic competition between nations triggered by new waves of industrialisation and imperialism. Growing tensions between the great powers and in the Balkans reached a breaking point on 28 June 1914, when a Bosnian Serb named Gavrilo Princip assassinated Archduke Franz Ferdinand, heir to the Austro-Hungarian throne. Austria-Hungary held Serbia responsible, and declared war on 28 July. Russia mobilised in Serbias defence, and by 4 August, Germany, Russia, France, and the United Kingdom were drawn into the war, with the Ottomans joining in November of the same year. Germanys strategy in 1914 was to quickly defeat France, then to transfer its forces to the Russian front. However, this failed, and by the end of the year the Western Front consisted of a continuous line of trenches stretching from the English Channel to Switzerland. The Eastern Front was more dynamic, but neither side could gain a decisive advantage, despite costly offensives. As the fighting expanded to more fronts, Italy, Bulgaria, Romania, Greece and others joined in from 1915 onward. In April 1917, the United States entered the war on the Allied side following Germanys resumption of unrestricted submarine warfare against Atlantic shipping; later that year, the Bolsheviks seized power in the Russian October Revolution, after which Soviet Russia signed an armistice with the Central Powers in December, followed by a separate peace in March 1918. That month, Germany`;

const options = "5,medium,all";

const prompt = await systemPromptTemplate.format({
  content: inputContent,
  options: options,
});


const res = await model.invoke([
  ["human", prompt],
]);

console.log(res.content);
