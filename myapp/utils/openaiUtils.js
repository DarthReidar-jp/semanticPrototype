const { OpenAI } = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function getMemoVector(content) {

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });

  return response.data[0].embedding;
}

module.exports = { getMemoVector };
