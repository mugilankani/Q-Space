import { PromptTemplate } from "@langchain/core/prompts"
import { model } from "./model.js";
import { LLMChain } from "langchain/chains";

const generateReport = async (context) => {
    const reportPromptTemplate = PromptTemplate.fromTemplate(
    `Given the questions, the correct answer and the user given incorrect answer, Analyze and give a detailed feedback on how to improve. Context: {context}`
);

    const reportChain = new LLMChain({
        llm: model,
        prompt: reportPromptTemplate
    })

    const reportResult = await reportChain.call({
        context: context
    })

    return reportResult
}

export {generateReport}