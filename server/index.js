import express from "express"
import cors from "cors"

import { generateQuiz } from "./generateQuestions.js"
import { extractJsonFromText } from "./utils/extractJSON.js"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.post("/generate-quiz", async (req, res) => {
    const { content, options } = req.body

    const quiz = await generateQuiz(content, options)

    const quizObject = extractJsonFromText(quiz)

    res.json(quizObject)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
