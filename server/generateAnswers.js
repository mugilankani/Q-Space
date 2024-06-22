import dotenv from "dotenv";
dotenv.config();
import { LLMChain } from "langchain/chains";
import { MongoClient } from "mongodb";
import { pipeline } from '@xenova/transformers'
import { PromptTemplate } from "@langchain/core/prompts"
import { model } from "./model.js";

const answerQuestion = async(question) => {

    const generateEmbeddings = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
    )

    const questionPromptTemplate = PromptTemplate.fromTemplate(
        `Given a question, convert it to a standalone question. question: {question} standalone question:`
    );

    const questionChain = new LLMChain({
        llm: model,
        prompt: questionPromptTemplate,
    })

    const questionResult = await questionChain.call({
        question: question
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
        const queryEmbedding = await embeddingFunction(query);
    
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
    console.log(searchResults)
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


    await client.close();
    return answerResult
}

export {answerQuestion}