# IELTS AI Backend

This is the backend server for the IELTS AI application, providing API endpoints for essay evaluation and feedback.

## Tech Stack

- Node.js
- Express.js
- OpenAI API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   ```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot-reload

## API Endpoints

### GET /
- Description: Welcome message
- Response: `{ message: "Welcome to IELTS AI API" }`

### Essay Routes (/api/essay)
- All essay-related endpoints are handled under this route
- Refer to the essay controller for specific endpoint documentation

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port number | No (defaults to 3000) |
| OPENAI_API_KEY | OpenAI API key for AI features | Yes |

## Project Structure

```
├── controllers/     # Request handlers
├── routes/         # API routes
├── server.js       # Main application file
├── .env           # Environment variables
└── package.json    # Project dependencies
```

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

ISC