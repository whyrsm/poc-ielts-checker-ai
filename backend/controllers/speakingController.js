const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Constants for OpenAI API costs
const COST_PER_1K_TOKENS = {
    prompt: 0.03,
    completion: 0.06,
    whisper: 0.006 // $0.006 per minute
};

/**
 * Calculates token usage and costs
 * @param {Object} usage - Token usage data from OpenAI
 * @param {number} audioLengthSeconds - Length of audio in seconds
 * @returns {Object} - Formatted usage and cost data
 */
const calculateUsageAndCosts = (usage, audioLengthSeconds) => {
    const { prompt_tokens, completion_tokens, total_tokens } = usage;
    
    const promptCost = (prompt_tokens / 1000) * COST_PER_1K_TOKENS.prompt;
    const completionCost = (completion_tokens / 1000) * COST_PER_1K_TOKENS.completion;
    const whisperCost = (audioLengthSeconds / 60) * COST_PER_1K_TOKENS.whisper;
    
    return {
        promptTokens: prompt_tokens,
        completionTokens: completion_tokens,
        totalTokens: total_tokens,
        audioLengthSeconds,
        costs: {
            promptCost: promptCost.toFixed(4),
            completionCost: completionCost.toFixed(4),
            whisperCost: whisperCost.toFixed(4),
            totalCost: (promptCost + completionCost + whisperCost).toFixed(4)
        }
    };
};

const evaluateSpeaking = async (audioBuffer, part) => {
    try {
        // Create a temporary file to store the audio buffer
        const tempFilePath = path.join(os.tmpdir(), `speaking-${Date.now()}.wav`);
        await fs.promises.writeFile(tempFilePath, audioBuffer);

        // Convert audio to text using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
        });

        // Clean up the temporary file
        await fs.promises.unlink(tempFilePath);

        // Evaluate the transcribed text using GPT-4
        const evaluation = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an expert IELTS Speaking examiner. Based on the speaking part being evaluated, consider these additional specific criteria:

Part 1 (Introduction and Interview):
- Ability to provide relevant personal information
- Comfort with familiar topics
- Natural conversation flow
- Appropriate elaboration of responses

Part 2 (Individual Long Turn):
- Topic development and organization
- Time management (speaking for 1-2 minutes)
- Use of appropriate connectives
- Relevant detail inclusion

Part 3 (Two-Way Discussion):
- Abstract idea discussion
- Opinion expression and justification
- Complex topic handling
- Interaction effectiveness

${part ? `You are evaluating Part ${part.slice(-1)} of the IELTS Speaking test.` : ""}

Evaluate according to these criteria:`
                },
                {
                    role: "system",
                    content: `You are an expert IELTS Speaking examiner. Evaluate the following speaking response according to the official IELTS Speaking band descriptors. Consider these specific criteria:

- Fluency and Coherence: Natural flow, speech rate, hesitation, topic development
- Lexical Resource: Vocabulary range, accuracy, idiomatic language use
- Grammatical Range and Accuracy: Structure variety, error frequency, complexity
- Pronunciation: Individual sounds, word stress, sentence stress, intonation

Provide a detailed evaluation in Markdown format using this structure:

# Band Scores

- Fluency and Coherence: [score /9.0] - [brief comment]
- Lexical Resource: [score /9.0] - [brief comment]
- Grammatical Range and Accuracy: [score /9.0] - [brief comment]
- Pronunciation: [score /9.0] - [brief comment]

**Overall Band Score:** [score /9.0]

# Detailed Feedback

## Fluency and Coherence
[Evaluate:
- Speech flow and natural pace
- Hesitation and self-correction
- Topic development and coherence
- Use of discourse markers]

## Lexical Resource
[Analyze:
- Vocabulary range and flexibility
- Word choice accuracy
- Idiomatic expressions
- Paraphrasing ability]

## Grammatical Range and Accuracy
[Assess:
- Sentence structure variety
- Grammar accuracy
- Complex structures usage
- Error patterns and impact]

## Pronunciation
[Evaluate:
- Individual sound clarity
- Word and sentence stress
- Intonation patterns
- Accent intelligibility]

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
3. [actionable improvement step 3]`
                },
                {
                    role: "system",
                    content: `You are an expert IELTS Speaking examiner. Based on the speaking part being evaluated, consider these additional specific criteria:

Part 1 (Introduction and Interview):
- Ability to provide relevant personal information
- Comfort with familiar topics
- Natural conversation flow
- Appropriate elaboration of responses

Part 2 (Individual Long Turn):
- Topic development and organization
- Time management (speaking for 1-2 minutes)
- Use of appropriate connectives
- Relevant detail inclusion

Part 3 (Two-Way Discussion):
- Abstract idea discussion
- Opinion expression and justification
- Complex topic handling
- Interaction effectiveness

${part ? `You are evaluating Part ${part.slice(-1)} of the IELTS Speaking test.` : ""}

Evaluate according to these criteria:`
                },
                {
                    role: "user",
                    content: `Please evaluate this IELTS speaking response: ${transcription.text}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        // Calculate audio length in seconds (assuming 16-bit PCM WAV format)
        const audioLengthSeconds = audioBuffer.length / (16000 * 2);

        // Calculate usage statistics
        const usage = calculateUsageAndCosts(evaluation.usage, audioLengthSeconds);

        return {
            transcription: transcription.text,
            feedback: evaluation.choices[0].message.content,
            usage
        };
    } catch (error) {
        throw new Error(`Evaluation failed: ${error.message}`);
    }
};

module.exports = {
    evaluateSpeaking
};