import { useState, useRef } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const SpeakingTest = () => {
    const [currentPart, setCurrentPart] = useState('part1');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlobs, setAudioBlobs] = useState({
        part1: null,
        part2: null,
        part3: null
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({
        part1: null,
        part2: null,
        part3: null
    });
    const [error, setError] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);

    const handlePartChange = (event, newPart) => {
        if (newPart !== null) {
            setCurrentPart(newPart);
            setError(null);
        }
    };

    const startRecording = async () => {
        try {
            setError(null);
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support audio recording');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            if (typeof MediaRecorder === 'undefined') {
                throw new Error('Your browser does not support MediaRecorder');
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlobs(prev => ({
                    ...prev,
                    [currentPart]: audioBlob
                }));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(1000);
            setIsRecording(true);
        } catch (err) {
            setError('Failed to access microphone. Please ensure you have granted permission.');
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const playRecording = () => {
        const audioBlob = audioBlobs[currentPart];
        if (audioBlob) {
            const audio = new Audio(URL.createObjectURL(audioBlob));
            audio.play();
        }
    };

    const handleSubmit = async () => {
        const audioBlob = audioBlobs[currentPart];
        if (!audioBlob) return;

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('part', currentPart);

        try {
            const response = await axios.post('http://localhost:3000/api/speaking/evaluate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(prev => ({
                ...prev,
                [currentPart]: response.data
            }));
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'An error occurred while evaluating your speaking');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                setError('Please upload an audio file');
                return;
            }
            setAudioBlobs(prev => ({
                ...prev,
                [currentPart]: file
            }));
            setError(null);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const partDescriptions = {
        part1: 'Introduction and Interview (4-5 minutes)',
        part2: 'Individual Long Turn (3-4 minutes)',
        part3: 'Two-Way Discussion (4-5 minutes)'
    };

    return (
        <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', mb: 4 }}>
            <Paper sx={{ p: 6 }}>
                <Typography variant="h6" gutterBottom>
                    Speaking Test
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Select Speaking Part
                    </Typography>
                    <ToggleButtonGroup
                        value={currentPart}
                        exclusive
                        onChange={handlePartChange}
                        aria-label="speaking part"
                    >
                        <ToggleButton value="part1" aria-label="part 1">
                            Part 1
                        </ToggleButton>
                        <ToggleButton value="part2" aria-label="part 2">
                            Part 2
                        </ToggleButton>
                        <ToggleButton value="part3" aria-label="part 3">
                            Part 3
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {partDescriptions[currentPart]}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        color={isRecording ? 'error' : 'primary'}
                        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={audioBlobs[currentPart] && !isRecording}
                    >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<UploadFileIcon />}
                        onClick={triggerFileUpload}
                        disabled={isRecording || loading}
                    >
                        Upload Audio
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="audio/*"
                        style={{ display: 'none' }}
                    />
                    {audioBlobs[currentPart] && (
                        <Button
                            variant="outlined"
                            startIcon={<PlayArrowIcon />}
                            onClick={playRecording}
                        >
                            Play Recording
                        </Button>
                    )}
                    {audioBlobs[currentPart] && (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit for Evaluation'}
                        </Button>
                    )}
                </Box>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {results[currentPart] && (
                    <Box sx={{ mt: 4 }}>
                        <Divider sx={{ mb: 3 }} />
                        <Typography variant="h6" gutterBottom>
                            Transcription
                        </Typography>
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                            <Typography>{results[currentPart].transcription}</Typography>
                        </Paper>

                        <Typography variant="h6" gutterBottom>
                            Evaluation
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <ReactMarkdown>{results[currentPart].feedback}</ReactMarkdown>
                        </Paper>

                        <Box sx={{ mt: 4 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Usage Statistics
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                            Token Usage
                                        </Typography>
                                        <Typography>Prompt Tokens: {results[currentPart].usage.promptTokens}</Typography>
                                        <Typography>Completion Tokens: {results[currentPart].usage.completionTokens}</Typography>
                                        <Typography>Total Tokens: {results[currentPart].usage.totalTokens}</Typography>
                                        <Typography>Audio Length: {results[currentPart].usage.audioLengthSeconds.toFixed(2)} seconds</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                            Cost Breakdown
                                        </Typography>
                                        <Typography>Prompt Cost: ${results[currentPart].usage.costs.promptCost}</Typography>
                                        <Typography>Completion Cost: ${results[currentPart].usage.costs.completionCost}</Typography>
                                        <Typography>Whisper Cost: ${results[currentPart].usage.costs.whisperCost}</Typography>
                                        <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
                                            Total Cost: ${results[currentPart].usage.costs.totalCost}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default SpeakingTest;