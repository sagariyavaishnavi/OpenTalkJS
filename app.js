import fs from "fs";
import path from "path";
import ollama from "ollama";


const category = process.argv[2]?.toLowerCase(); 
const questionFile = process.argv[3]?.toLowerCase(); 

console.log(`Category selected: ${category}`);
console.log(`Question file specified: ${questionFile}`);

const categoriesFolder = "./category";
const ansFolder = "./ans";


const validCategories = ["academic", "creative", "professional", "technical", "marketing"];


if (!validCategories.includes(category)) {
  console.error("Invalid category! Choose between: academic, creative, professional, technical, marketing.");
  process.exit(1);
}

const categoryPath = path.join(categoriesFolder, category);

if (!questionFile || !/^q\d+\.txt$/.test(questionFile)) {
  console.error("Invalid question file! Specify a file like q1.txt, q2.txt, etc.");
  process.exit(1);
}

const questionFilePath = path.join(categoryPath, questionFile);

let questionContent;
try {
  questionContent = fs.readFileSync(questionFilePath, "utf-8");
  console.log(`Reading question file: ${questionFile}`);
} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
}

async function queryLLM(question, answerFilePath) {
  try {
    const response = await ollama.chat({
      model: "llama3.2:1b",
      messages: [{ role: "user", content: question }],
    });

    if (!response || !response.message || !response.message.content) {
      throw new Error("Invalid response from the LLM.");
    }

    const answerContent = response.message.content;
    fs.writeFileSync(answerFilePath, answerContent, "utf-8");
    console.log(`Answer saved to: ${answerFilePath}`);
  } catch (err) {
    console.error(`Error querying LLM: ${err.message}`);
  }
}

const ansCategoryPath = path.join(ansFolder, category);
if (!fs.existsSync(ansCategoryPath)) {
  fs.mkdirSync(ansCategoryPath, { recursive: true });
}

const answerFiles = fs.readdirSync(ansCategoryPath);
const nextAnswerFile = `a${answerFiles.length + 1}.txt`;
const answerFilePath = path.join(ansCategoryPath, nextAnswerFile);

queryLLM(questionContent, answerFilePath);
