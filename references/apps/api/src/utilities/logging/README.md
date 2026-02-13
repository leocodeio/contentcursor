# logging module

### For database logging, you should add this schema to prisma schema:

```prisma
model LogEntry {
  id            String   @id @default(cuid())
  level         String
  message       String
  correlationId String
  metadata      Json?
  context       Json?
  type          String?
  method        String?
  url           String?
  statusCode    Int?
  duration      String?
  error         Json?
  createdAt     DateTime @default(now())

  @@map("logs")
}
```
