# Security Guidelines

## Credentials & Secrets

- **Never** commit real credentials (API keys, passwords, connection strings) to Git.
- Use `.env` for local secrets; `.env` is in `.gitignore` and must stay there.
- Copy `.env.example` to `.env` and fill in values locally. Do not commit `.env`.

## Frontend

- MongoDB: The frontend **must not** contain MongoDB connection strings. All DB access goes through the backend API.
- ChromaDB: Use `VITE_CHROMA_*` env vars only. Never hardcode API keys.

## If Credentials Were Exposed

1. **Rotate immediately**: Change passwords, regenerate API keys in MongoDB Atlas and ChromaDB.
2. **Remove from history** (optional): Use [GitHub's guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) if you need to scrub history.
3. **Update `.env`** on all deployments (Vercel, etc.) with the new values.
