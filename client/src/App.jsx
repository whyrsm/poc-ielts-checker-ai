import { useState } from 'react'
import { Container, Typography, Box, Button, Paper, CircularProgress, ThemeProvider, createTheme, Divider, Grid, List, ListItem, ListItemText } from '@mui/material'
import ReactQuill from 'react-quill'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'
import './App.css'

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
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('http://localhost:3000/api/essay/check', { essay })
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
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        IELTS Writing Checker
      </Typography>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" gutterBottom>
          Your Essay Writing
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <ReactQuill
            theme="snow"
            value={essay}
            onChange={setEssay}
            style={{ height: '300px', marginBottom: '50px' }}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['clean']
              ]
            }}
          />
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !essay.trim()}
            >
              {loading ? <CircularProgress size={24} /> : 'Check'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#ffebee', borderLeft: '4px solid #ef5350' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {result && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Evaluation Result
          </Typography>
          <Box className="evaluation-content" sx={{ mb: 3 }}>
            <ReactMarkdown>{result}</ReactMarkdown>
          </Box>
          
          {/* API Usage Statistics */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            API Usage Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Token Usage
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Input Tokens" secondary={usage.promptTokens} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Output Tokens" secondary={usage.completionTokens} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Total Tokens" secondary={usage.totalTokens} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cost Breakdown (USD)
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Input Cost" secondary={`$${usage.costs.promptCost}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Output Cost" secondary={`$${usage.costs.completionCost}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Total Cost" secondary={`$${usage.costs.totalCost}`} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
    </Box>
    </ThemeProvider>
  )
}

export default App
