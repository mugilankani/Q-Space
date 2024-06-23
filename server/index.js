import express from "express"
import cors from "cors"
import multer from "multer"
import fs from "fs"
import { PDFExtract } from 'pdf.js-extract'
import { generateQuiz } from "./generateQuestions.js"
import { extractJsonFromText } from "./utils/extractJSON.js"
import { answerQuestion } from "./generateAnswers.js"
import { splitText } from "./textSplitter.js" 
import { generateReport } from "./generateReport.js"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/" })

const pdfExtract = new PDFExtract()

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
    await splitText(content)
    const { difficulty, questionCount, questionType } = req.body
    console.log(difficulty, questionCount, questionType)

    const options = `${difficulty}, ${questionCount}, ${questionType}`

    const quiz = await generateQuiz(content, options)

    const quizObject = extractJsonFromText(quiz)

    res.json(quizObject)
})

app.post("/generate-answer",async (req,res) => {
    const question = req.body.question
    const result = await answerQuestion(question)
    console.log(result.text)
    res.json(result)
})

app.post("/generate-report",async (req,res) => {
    const context = req.body.context
    console.log(context)
    const result = await generateReport(context)
    res.json(result)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
