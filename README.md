# Knowledge Hub API

## Prerequisites
- Node.js 24.x.x
- npm

## Installation
git clone {repository URL}
cd nodejs-2026q1-knowledge-hub
npm install
cp .env.example .env

## Running
npm start

## API Documentation
After starting, open http://localhost:4000/doc

## Testing
npm run test

## Endpoints
- GET/POST /user
- GET/PUT/DELETE /user/:id
- GET/POST /article
- GET/PUT/DELETE /article/:id
- GET/POST /category
- GET/PUT/DELETE /category/:id
- GET /comment?articleId={id}
- POST /comment
- DELETE /comment/:id