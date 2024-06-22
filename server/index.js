import express from "express"
import cors from "cors"
import multer from "multer"
import fs from "fs"
import { PDFExtract } from 'pdf.js-extract'
import { generateQuiz } from "./generateQuestions.js"
import { extractJsonFromText } from "./utils/extractJSON.js"
import { answerQuestion } from "./generateAnswers.js"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

<<<<<<< HEAD
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
=======
const upload = multer({ dest: "uploads/" })
>>>>>>> fc09818db69de1c1fb388f0a93ca6e0c2a199995

const pdfExtract = new PDFExtract()

const logger = (req, res, next) => {
    const start = Date.now()
    const logRequest = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`

<<<<<<< HEAD
const chain = new LLMChain({
    llm: model,
    prompt: systemPromptTemplate,
  });
  
// const result = await chain.call({
//     content: inputContent,
//     options: options,
// });

// console.log(result.text);

const questionPromptTemplate = PromptTemplate.fromTemplate(
    `Given a question, convert it to a standalone question. question: {question} standalone question:`
);

const questionChain = new LLMChain({
    llm: model,
    prompt: questionPromptTemplate,
})

const questionResult = await questionChain.call({
    question: "I dont know much about history, I want to if united states participated in world war I?"
})

console.log(questionResult.text)

const client = new MongoClient(process.env.MONGODB_ATLAS_URI);
await client.connect()
const namespace = "QSpace.Sample";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

async function embeddingFunction(text){

    const result = await generateEmbeddings(text, {
        pooling: 'mean',
        normalize: true
    })
    return Array.from(result.data);
}

async function customVectorSearch(query, collection, embeddingFunction, topK = 5) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await embeddingFunction(query);
  
      // Perform the vector search
      const results = await collection.aggregate([
        {
            '$vectorSearch': {
              'index': 'vector_index', 
              'path': 'embedding', 
              'queryVector': queryEmbedding, 
              'numCandidates': 150, 
              'limit': 10
            }
          }, {
            '$project': {
              'text' : 1,
              'score': {
                '$meta': 'vectorSearchScore'
              }
            }
          }
      ]).toArray();
  
      return results;
    } catch (error) {
      console.error("Error in customVectorSearch:", error);
      throw error;
    }
  }

const searchResults = await customVectorSearch(questionResult.text, collection, embeddingFunction);
const combinedText = searchResults.reduce((acc, current) => acc + ' ' + current.text, '');
    // return combinedText;
    // console.log("Search results:", combinedText);

  const answerPromptTemplate = PromptTemplate.fromTemplate(
    `Given a question answer the question based on the context provided. question: {question} context: {context} answer:`
);

const answerChain = new LLMChain({
    llm: model,
    prompt: answerPromptTemplate,
})

const answerResult = await answerChain.call({
    question: questionResult.text,
    context: combinedText
})

console.log(answerResult.text)

await client.close();

// console.log(res.content);
=======
    res.on("finish", () => {
        const duration = Date.now() - start
        console.log(`${logRequest} - ${duration}ms`)
    })

    next()
}

app.use(logger)

app.post("/generate-quiz", upload.single("file"), async (req, res) => {
    let content
    if (req.file) {
        if (req.file.mimetype === "application/pdf") {
            try {
                const data = await pdfExtract.extract(req.file.path, {})
                content = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n')
            } catch (error) {
                console.error("Error extracting PDF:", error)
                return res.status(500).json({ error: "Failed to extract PDF content" })
            }
        } else if (req.file.mimetype === "text/plain") {
            content = fs.readFileSync(req.file.path, "utf8")
        } else {
            return res.status(400).json({ error: "Unsupported file type" })
        }
        fs.unlinkSync(req.file.path)
    } else if (req.body.content) {
        content = req.body.content
    } else {
        return res.status(400).json({ error: "No content provided" })
    }

    const { difficulty, questionCount, questionType } = req.body
    console.log(difficulty, questionCount, questionType)

    const options = `${difficulty}, ${questionCount}, ${questionType}`

    const quiz = await generateQuiz(content, options)

    const quizObject = extractJsonFromText(quiz)

    res.json(quizObject)
})

app.get("/generate-answer",async (req,res) => {
    const question = req.body.question
    const result = await answerQuestion(question)
    console.log(result.text)
    res.json(result)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
>>>>>>> fc09818db69de1c1fb388f0a93ca6e0c2a199995
