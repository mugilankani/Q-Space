import dotenv from "dotenv";
dotenv.config();
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MongoClient } from "mongodb";
import { pipeline } from '@xenova/transformers'

const splitText = async (inputContent) => {

    const generateEmbeddings = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
)

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50
})

const output = await splitter.createDocuments([inputContent])

const client = new MongoClient(process.env.MONGODB_ATLAS_URI);
const namespace = "QSpace.Sample";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

  
async function embedDocuments(content) {
    const embeddings = [];
    for (const chunk of content) {
    const result = await generateEmbeddings(chunk.pageContent, {
        pooling: 'mean',
        normalize: true
    });
    embeddings.push(Array.from(result.data));
    }
    return embeddings;
}

async function addDocumentsToVectorStore(documents, collection) {
    const embeddings = await embedDocuments(documents);
    
    const vectorEntries = documents.map((doc, i) => ({
      text: doc.pageContent,
      embedding: embeddings[i],
      metadata: doc.metadata
    }));
  
    await collection.insertMany(vectorEntries);
  }
  
try {
    await addDocumentsToVectorStore(output, collection);
} catch (error) {
    console.log(error)
}
    
await client.close();
}

export {splitText}