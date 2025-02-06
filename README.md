# IELTS Writing Checker

An AI-powered application that helps users improve their IELTS writing skills by providing detailed feedback and scoring based on official IELTS criteria.

## Features

- Instant essay evaluation for IELTS Task 1 and Task 2
- Detailed feedback on Task Response, Coherence and Cohesion, Lexical Resource, and Grammar
- Band score prediction for each criterion
- Actionable improvement suggestions
- Token usage and cost tracking

## Tech Stack

### Frontend
- React.js with Vite
- Modern UI components
- Responsive design

### Backend
- Node.js
- Express.js
- OpenAI API (GPT-4)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Project Structure

```
├── client/          # React frontend application
└── backend/         # Express backend server
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Start both backend and frontend servers
2. Access the application at http://localhost:5173
3. Choose the IELTS task type (Task 1 or Task 2)
4. Enter your essay text
5. Submit for evaluation
6. Review the detailed feedback and scores

## API Endpoints

### Essay Routes (/api/essay)
- `GET /api/essay/health` - Check OpenAI API connection
- `POST /api/essay/check` - Submit essay for evaluation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.