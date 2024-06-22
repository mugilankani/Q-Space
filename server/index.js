import express from "express"
import cors from "cors"
import multer from "multer"
import fs from "fs"
import { PDFExtract } from 'pdf.js-extract'

import { generateQuiz } from "./generateQuestions.js"
import { extractJsonFromText } from "./utils/extractJSON.js"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

// Configure multer for file uploads
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
        // If a file was uploaded
        if (req.file.mimetype === "application/pdf") {
            // Handle PDF
            try {
                const data = await pdfExtract.extract(req.file.path, {})
                content = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n')
            } catch (error) {
                console.error("Error extracting PDF:", error)
                return res.status(500).json({ error: "Failed to extract PDF content" })
            }
        } else if (req.file.mimetype === "text/plain") {
            // Handle text file
            content = fs.readFileSync(req.file.path, "utf8")
        } else {
            return res.status(400).json({ error: "Unsupported file type" })
        }
        // Delete the uploaded file after processing
        fs.unlinkSync(req.file.path)
    } else if (req.body.content) {
        // If text content was sent directly
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})