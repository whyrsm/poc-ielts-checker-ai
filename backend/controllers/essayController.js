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

        const { essay, taskType } = req.body;

        if (!essay) {
            return res.status(400).json({ error: 'Essay text is required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key is not configured');
            return res.status(500).json({ error: 'OpenAI API key is not configured' });
        }

        const task1Criteria = `
- Accurate data selection and comparison
- Clear overview of main trends
- Data presentation and progression
- Appropriate use of language for data description`;

        const task2Criteria = `
- Clear position throughout
- Main ideas fully developed
- Relevant examples and evidence
- Logical argument progression`;

        const prompt = `As an experienced IELTS examiner, evaluate the following ${taskType === 'task1' ? 'Task 1' : 'Task 2'} essay according to the official IELTS Writing band descriptors. Consider these specific criteria for ${taskType === 'task1' ? 'Task 1' : 'Task 2'}:${taskType === 'task1' ? task1Criteria : task2Criteria}

Provide a detailed evaluation in Markdown format using this structure:

# Band Scores

- Task Response: [score /9.0] - [brief comment]
- Coherence and Cohesion: [score /9.0] - [brief comment]
- Lexical Resource: [score /9.0] - [brief comment]
- Grammatical Range and Accuracy: [score /9.0] - [brief comment]

**Overall Band Score:** [score /9.0]

# Detailed Feedback

## Task Response
[Provide specific feedback on how well the essay addresses the task requirements, including:
- For Task 1: data coverage, key features, trends, comparisons
- For Task 2: position, main ideas, supporting evidence, conclusions]

## Coherence and Cohesion
[Evaluate:
- Paragraph organization
- Logical progression
- Use of cohesive devices
- Referencing]

## Lexical Resource
[Analyze:
- Vocabulary range and accuracy
- Word choice and formation
- Collocations and idiomatic expressions
- Topic-specific terminology]

## Grammatical Range and Accuracy
[Assess:
- Sentence structures
- Grammar accuracy
- Punctuation
- Complex structures usage]

# Strengths
- [key strength 1]
- [key strength 2]
- [key strength 3]

# Areas for Improvement
- [specific area 1 with example and suggestion]
- [specific area 2 with example and suggestion]
- [specific area 3 with example and suggestion]

# Next Steps
1. [actionable improvement step 1]
2. [actionable improvement step 2]
3. [actionable improvement step 3]

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