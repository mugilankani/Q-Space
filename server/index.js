import express from "express"
import cors from "cors"

import { generateQuiz } from "./generateQuestions.js"
import { extractJsonFromText } from "./utils/extractJSON.js"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const logger = (req, res, next) => {
    const start = Date.now()
    const logRequest = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`

    res.on("finish", () => {
        const duration = Date.now() - start
        console.log(`${logRequest} - ${duration}ms`)
    })

    next()
}

app.use(logger)

app.post("/generate-quiz", async (req, res) => {
    const { content, difficulty, questionCount, questionType } = req.body
    console.log(difficulty, questionCount, questionType)

    const options = `${difficulty}, ${questionCount}, ${questionType}`

    const quiz = await generateQuiz(content, options)

    const quizObject = extractJsonFromText(quiz)

    res.json(quizObject)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
