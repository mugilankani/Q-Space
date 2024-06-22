const extractJsonFromText = (text) => {
    console.log(text)
    const match = text.match(/```(.*?)```/s)
    if (match && match[1]) {
        try {
            return JSON.parse(match[1].slice(4))
        } catch (e) {
            throw new Error("Invalid JSON format")
        }
    } else {
        throw new Error("No JSON found within triple backticks")
    }
}

export { extractJsonFromText }
