# Pomodoro Timer

A simple Pomodoro Timer web app built with Google AI Studio and deployed to Cloud Run. Helps you manage focus sessions and breaks using the Pomodoro technique, with a clean, minimal interface for tracking work intervals.

🔗 **Live on AI Studio:** https://ai.studio/apps/a0c7581c-34ec-450f-879d-37501242172b

## Features

- Focus and break interval timer based on the Pomodoro technique
- Clean, minimal UI
- Deployed on Google Cloud Run

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
```bash
   npm install
```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
```bash
   npm run dev
```

## Tech Stack

- Google AI Studio
- Gemini API
- Google Cloud Run

## Deployment

This app is deployed using **Google Cloud Run** for scalable, serverless hosting.
