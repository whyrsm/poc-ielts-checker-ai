const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Constants for evaluation criteria
const EVALUATION_CRITERIA = {
    task1: `
- Accurate data selection and comparison
- Clear overview of main trends
- Data presentation and progression
- Appropriate use of language for data description`,
    task2: `
- Clear position throughout
- Main ideas fully developed
- Relevant examples and evidence
- Logical argument progression`
};

// Constants for OpenAI API costs
const COST_PER_1K_TOKENS = {
    prompt: 0.03,
    completion: 0.06
};

/**
 * Checks the connection to OpenAI API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkOpenAIConnection = async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 5
        });

        if (completion.choices[0].message) {
            return res.json({ status: 'success', message: 'OpenAI connection is working' });
        }
    } catch (error) {
        console.error('OpenAI connection error:', error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Failed to connect to OpenAI',
            error: error.message 
        });
    }
};

/**
 * Validates the essay submission request
 * @param {Object} req - Express request object
 * @returns {Object|null} - Returns error object if validation fails, null if passes
 */
const validateEssayRequest = (req) => {
    const { essay, taskType } = req.body;

    if (!essay) {
        return { status: 400, message: 'Essay text is required' };
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is not configured');
        return { status: 500, message: 'OpenAI API key is not configured' };
    }

    if (!['task1', 'task2'].includes(taskType)) {
        return { status: 400, message: 'Invalid task type. Must be either "task1" or "task2"' };
    }

    return null;
};

/**
 * Generates the evaluation prompt based on task type
 * @param {string} taskType - Type of the task (task1 or task2)
 * @param {string} essay - The essay text to evaluate
 * @returns {string} - The formatted prompt for OpenAI
 */
const generateEvaluationPrompt = (taskType, essay) => {
    const criteria = EVALUATION_CRITERIA[taskType];
    const taskNumber = taskType === 'task1' ? '1' : '2';

    return `As an experienced IELTS examiner, evaluate the following Task ${taskNumber} essay according to the official IELTS Writing band descriptors. Consider these specific criteria for Task ${taskNumber}:${criteria}

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
};

/**
 * Calculates token usage and costs
 * @param {Object} usage - Token usage data from OpenAI
 * @returns {Object} - Formatted usage and cost data
 */
const calculateUsageAndCosts = (usage) => {
    const { prompt_tokens, completion_tokens, total_tokens } = usage;
    
    const promptCost = (prompt_tokens / 1000) * COST_PER_1K_TOKENS.prompt;
    const completionCost = (completion_tokens / 1000) * COST_PER_1K_TOKENS.completion;
    
    return {
        promptTokens: prompt_tokens,
        completionTokens: completion_tokens,
        totalTokens: total_tokens,
        costs: {
            promptCost: promptCost.toFixed(4),
            completionCost: completionCost.toFixed(4),
            totalCost: (promptCost + completionCost).toFixed(4)
        }
    };
};

/**
 * Handles essay evaluation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkEssay = async (req, res) => {
    try {
        const validationError = validateEssayRequest(req);
        if (validationError) {
            return res.status(validationError.status).json({ error: validationError.message });
        }

        const { essay, taskType } = req.body;
        const prompt = generateEvaluationPrompt(taskType, essay);

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
        });

        const evaluation = completion.choices[0].message.content;
        const usage = calculateUsageAndCosts(completion.usage);

        res.json({ evaluation, usage });
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