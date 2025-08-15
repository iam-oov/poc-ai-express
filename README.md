# 🚛 POC AI Nest.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%5E11.0.0-red.svg)](https://nestjs.com/)

A sophisticated Nest.js application implementing **Retrieval-Augmented Generation (RAG)** using Google's Gemini AI, Pinecone vector database, and Notion as a data source. This proof-of-concept demonstrates modern AI integration patterns with clean architecture principles.

## ✨ Features

- 🤖 **AI-Powered Responses** using Google Gemini Model 2.5 Flash
- 🔍 **Semantic Search** with Google AI embeddings
- 📚 **Document Retrieval** from Notion workspace
- 🗄️ **Vector Storage** via Pinecone database
- 🏗️ **Clean Architecture** with hexagonal design patterns
- 🚀 **RESTful API** with Nest.js

## 🏛️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) principles:

```
📁 src/
├── 📁 rag/
│   ├── 📁 application/        # Use cases & business logic
│   │   └── services/
│   ├── 📁 domain/            # Core business entities & ports
│   │   └── ports/
│   └── 📁 infra/             # External adapters & controllers
│       ├── 📁 adapters/
│       ├── 📁 controllers/
│       └── 📁 dtos/
└── 📁 shared/                # Shared modules & utilities
```

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Nest.js 11.x
- **Language**: TypeScript

### AI & ML Services

- **LLM**: Google Gemini 2.5 Flash
- **Embeddings**: Google AI (embedding-001)
- **Vector Database**: Pinecone
- **Data Source**: Notion API

## ⚡ Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Yarn
- Google AI API key
- Pinecone account
- Notion integration token

### Installation

```bash
# Clone the repository
git clone https://github.com/iam-oov/poc-ai-express.git
cd poc-ai-express

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys (see Configuration section)

# Initialize Pinecone index
yarn create-index

# Load data from Notion
yarn load-db

# Start development server
yarn start:dev
```

The server will start on `http://localhost:4000` (or your configured PORT).

## 🐳 Docker Usage

### Using Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at `http://localhost:4000` (or your configured PORT).

### Using Docker Commands

You can also use Docker commands directly:

```bash
# Build the Docker image
docker build -t poc-ragapp .

# Run the container
docker run -p 4000:4000 \
  --env-file .env \
  --name ragapp \
  poc-ragapp
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Application
NODE_ENV=development
PORT=4000

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_EMBEDDINGS=embedding-001

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_index_name

# Notion Integration
NOTION_API_KEY=your_notion_integration_token
```

## ⚙️ API Reference

### POST [/api/rag/question](http://localhost:4000/api/rag/question)

Performs RAG-based question answering using your Notion knowledge base.

**Request:**

```json
{
  "question": "Que edad tiene Faker ?"
}
```

**Response:**

```json
{
  "data": {
    "answer": "Según el contexto, Faker nació el 7 de mayo de 1996. Dado que el texto menciona que ganó el Campeonato Mundial en 2024, podemos inferir que la \"actualidad\" del texto es 2024.\n\nPor lo tanto, en 2024, Faker tiene **28 años**."
  }
}
```

## 📁 Available Scripts

```bash
# Development
yarn start:dev          # Start with hot reload
yarn start              # Start production server
yarn build              # Build for production

# Data Management
yarn create-index       # Initialize Pinecone index
yarn load-db            # Load Notion pages into vector store
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ by [Osvaldo Hinojosa](mailto:osvaldo.javier14@gmail.com)**
