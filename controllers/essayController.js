const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const checkOpenAIConnection = async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 5
        });

        if (completion.choices[0].message) {
            res.json({ status: 'success', message: 'OpenAI connection is working' });
        }
    } catch (error) {
        console.error('OpenAI connection error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to connect to OpenAI',
            error: error.message 
        });
    }
};

const checkEssay = async (req, res) => {
    try {
        const { essay } = req.body;

        if (!essay) {
            return res.status(400).json({ error: 'Essay text is required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key is not configured');
            return res.status(500).json({ error: 'OpenAI API key is not configured' });
        }

        const prompt = `As an IELTS examiner, evaluate the following essay according to the IELTS Writing band descriptors and provide the response in Markdown format using the following structure:

# Band Scores

- Task Response: [score] - [brief comment]
- Coherence and Cohesion: [score] - [brief comment]
- Lexical Resource: [score] - [brief comment]
- Grammatical Range and Accuracy: [score] - [brief comment]

**Overall Band Score:** [score]

# Detailed Feedback

## Task Response
[detailed feedback for task response]

## Coherence and Cohesion
[detailed feedback for coherence and cohesion]

## Lexical Resource
[detailed feedback for lexical resource]

## Grammatical Range and Accuracy
[detailed feedback for grammatical range and accuracy]

# Recommendations for Improvement

- [recommendation 1]
- [recommendation 2]
- [recommendation 3]

Essay to evaluate: ${essay}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
        });

        const evaluation = completion.choices[0].message.content;
        
        // Calculate token usage and costs
        const promptTokens = completion.usage.prompt_tokens;
        const completionTokens = completion.usage.completion_tokens;
        const totalTokens = completion.usage.total_tokens;
        
        const promptCost = (promptTokens / 1000) * 0.03;
        const completionCost = (completionTokens / 1000) * 0.06;
        const totalCost = promptCost + completionCost;

        res.json({ 
            evaluation,
            usage: {
                promptTokens,
                completionTokens,
                totalTokens,
                costs: {
                    promptCost: promptCost.toFixed(4),
                    completionCost: completionCost.toFixed(4),
                    totalCost: totalCost.toFixed(4)
                }
            }
        });
    } catch (error) {
        console.error('Error checking essay:', error);
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error evaluating essay';
        res.status(500).json({ error: errorMessage });
    }
};

module.exports = {
    checkEssay,
    checkOpenAIConnection
};