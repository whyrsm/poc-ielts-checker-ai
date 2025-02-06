import { useState } from 'react'
import { Container, Typography, Box, Button, Paper, CircularProgress, ThemeProvider, createTheme, Divider, Grid, List, ListItem, ListItemText, ToggleButtonGroup, ToggleButton } from '@mui/material'
import ReactQuill from 'react-quill'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'
import './App.css'
import SpeakingTest from './components/SpeakingTest'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#1976d2',
    },
    h6: {
      fontWeight: 500,
      color: '#2c3e50',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
  },
})

function App() {
  const [testType, setTestType] = useState('writing')
  const [taskType, setTaskType] = useState('task2')
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState(null)

  const handleTestTypeChange = (event, newTestType) => {
    if (newTestType !== null) {
      setTestType(newTestType)
      setResult(null)
      setError(null)
      setUsage(null)
    }
  }

  const handleTaskTypeChange = (event, newTaskType) => {
    if (newTaskType !== null) {
      setTaskType(newTaskType)
      setEssay('')
      setResult(null)
      setError(null)
      setUsage(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('http://localhost:3000/api/essay/check', { essay, taskType })
      setResult(response.data.evaluation)
      setUsage(response.data.usage)
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred while checking your essay');
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        IELTS AI Assistant
      </Typography>

      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Test Type
          </Typography>
          <ToggleButtonGroup
            value={testType}
            exclusive
            onChange={handleTestTypeChange}
            aria-label="IELTS test type"
          >
            <ToggleButton value="writing" aria-label="writing test">
              Writing
            </ToggleButton>
            <ToggleButton value="speaking" aria-label="speaking test">
              Speaking
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {testType === 'writing' ? (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Select Task Type
              </Typography>
              <ToggleButtonGroup
                value={taskType}
                exclusive
                onChange={handleTaskTypeChange}
                aria-label="IELTS writing task type"
              >
                <ToggleButton value="task1" aria-label="task 1">
                  Task 1
                </ToggleButton>
                <ToggleButton value="task2" aria-label="task 2">
                  Task 2
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {taskType === 'task1' ? 'Academic Task 1' : 'Academic Task 2'}
              </Typography>
              <ReactQuill
                value={essay}
                onChange={setEssay}
                style={{ height: '200px', marginBottom: '50px' }}
              />
              <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!essay.trim() || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Check Essay'}
                </Button>
              </Box>
            </Paper>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {result && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Evaluation Results
                </Typography>
                <ReactMarkdown>{result}</ReactMarkdown>

                {usage && (
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Token Usage
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary={`Prompt Tokens: ${usage.promptTokens}`}
                          secondary={`Cost: $${usage.costs.promptCost}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={`Completion Tokens: ${usage.completionTokens}`}
                          secondary={`Cost: $${usage.costs.completionCost}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={`Total Tokens: ${usage.totalTokens}`}
                          secondary={`Total Cost: $${usage.costs.totalCost}`}
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </Paper>
            )}
          </>
        ) : (
          <SpeakingTest />
        )}
      </Box>
    </Container>
    </Box>
    </ThemeProvider>
  )
}

export default App
