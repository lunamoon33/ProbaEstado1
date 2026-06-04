# Agents Overview

This folder implements a Multi-Agent pattern for the backend. Components:

- `MasterAgent`: orchestrator that routes requests to specialized agents.
- `ReportAgent`: analyzes and classifies citizen reports.
- `VerificationAgent`: queries blockchain via `blockchainService` and validates hashes.
- `AIAgent`: interfaces with OpenAI for summarization and text generation.
- `DiscordProxyAgent`: receives Discord messages and forwards them to `MasterAgent`.

Internal endpoint for testing (admin only): `POST /api/agents/process`.

Payload example:

{
  "message": "reporte",
  "source": "discord",
  "payload": { "title": "...", "description": "..." }
}
