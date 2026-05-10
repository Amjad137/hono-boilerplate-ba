```
## Hono Boilerplate (Backend API)

Opinionated Hono + TypeScript backend boilerplate with auth, MongoDB, repository pattern, and a structured validation layer.

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Web framework: Hono
- Auth: better-auth with the MongoDB adapter
- Database: MongoDB
- Validation: Yup with a custom Hono middleware wrapper
- Email: Resend (optional, see config)
- File storage: S3-compatible (optional, see config)
- Linting: ESLint
- Commits: Commitlint
- Containers/CI: Docker + Cloud Build config

## Architecture Notes

- Repository pattern is used for data access and query encapsulation.
- Services implement business logic and orchestration.
- Handlers (route controllers) stay thin and call services.
- DTOs and validators define input contracts at the edges.

## Auth Details

Authentication is powered by better-auth using the MongoDB adapter. This keeps auth state and sessions in MongoDB and aligns with the rest of the data layer.

## Validation (Yup + Hono)

We use Yup schemas and a custom Hono middleware to validate request payloads. This gives a consistent, typed validation layer across handlers.

## Project Structure (Highlights)

- src/config: app, db, env, auth, email, and storage configs
- src/handlers: route handlers grouped by version
- src/services: business logic
- src/Repositories: data access layer (repository pattern)
- src/validators: Yup schemas and validation middleware

## Getting Started

```

npm install
npm run dev

```

```

open http://localhost:3000

```

```
