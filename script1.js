import fs from "fs/promises";
import ollama from "ollama";

const inputFilePath = "q.txt";
const outputFilePath = "a.txt";

fs.readFile(inputFilePath, "utf-8")
  .then((inputContent) => {
    return ollama.chat({
      model: "llama3.2:1b",
      messages: [{ role: "user", content: inputContent }],
    });
  })
  .then((response) => {
    if (!response || !response.message || !response.message.content) {
      throw new Error("Invalid response from the chatbot model.");
    }
    const chatbotResponse = response.message.content;
    return fs.writeFile(outputFilePath, chatbotResponse, "utf-8");
  })
  .then(() => {
    console.log("Chatbot response has been saved to a.txt.");
  })
  .catch((error) => {
    if (error.code === "ENOENT") {
      console.error(`File not found: ${error.path}`);
    } else if (error.code === "EACCES") {
      console.error(`Permission denied: ${error.path}`);
    } else {
      console.error("Error occurred:", error.message);
    }
  });
