# PermissionGuard AI

PermissionGuard AI is an independent permission intelligence product that helps people understand what an application declares it can access before they trust it.

## Product capabilities

- Analyze an APK, a public application URL, or an app-store listing
- Extract and classify declared Android permissions without executing uploaded files
- Explain purpose relevance, privacy impact, confidence, and least-privilege recommendations
- Produce a transparent security score and visual risk dashboard
- Compare two application versions to identify permission drift
- Answer security questions from the current report only

## Privacy and security

APK files are validated for filename, MIME type, signature, and size. They are parsed as untrusted static data, never executed, and not retained after processing. Reports identify declared permissions and static analysis clearly; they do not make claims about runtime behavior.

## Run locally

1. Copy `.env.example` to `.env`.
2. Configure a long random `JWT_SECRET` for production use.
3. Install project dependencies.
4. Start the development service:

```bash
npm run dev
```

Run verification:

```bash
npm test
npm run build
```

## Configuration

| Variable | Purpose |
| --- | --- |
| `PORT` | Local service port |
| `CORS_ORIGIN` | Allowed product origin |
| `RATE_LIMIT_PER_MINUTE` | Request protection threshold |
| `MAX_APK_BYTES` | APK upload limit |
| `JWT_SECRET` | Secure session signing secret |

## Limitations

PermissionGuard AI evaluates available metadata and declared permissions. It cannot confirm private implementation details, runtime behavior, tracker behavior, or whether access was actually used.
