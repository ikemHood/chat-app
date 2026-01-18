# Chat App Development Agent Rules

## Core Stack (Non-Negotiable)
- **Runtime**: Bun exclusively
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better-auth
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui components + blocks (mandatory first choice)
- **API**: tRPC for HTTP endpoints
- **Real-time**: WebSocket for live features

## Real-time Features via WebSocket
- Typing indicators (show when user is typing)
- Message delivery (send/receive messages)
- Online/offline status broadcasting
- No polling - WebSocket only for real-time data

## Database Schema Requirements
- Users table (id, email, name, status: online/offline, lastSeen)
- Messages table (id, senderId, receiverId, content, timestamp, read)
- Conversations table (implicit - query from messages)
- Prisma schema must support efficient queries for user status + message history

## Authentication & Authorization
- Better-auth for signup/login
- Session management via Better-auth
- WebSocket authentication using session tokens
- Protect all tRPC routes with auth middleware

## UI/UX Standards
- **Always use shadcn/ui blocks first** - check blocks library before custom components
- Meticulous attention to design specifications provided
- Responsive design (mobile-first)
- Real-time feedback (typing indicators, online status, message timestamps)
- Loading states for all async operations

## Component Architecture
1. Check shadcn/ui blocks for chat layouts, message bubbles, user lists
2. Use shadcn/ui components for inputs, buttons, avatars, badges
3. Custom components only when shadcn doesn't provide equivalent
4. Keep components atomic and reusable

## Features Checklist
- [ ] User signup/login (Better-auth)
- [ ] Public user directory (all registered users visible)
- [ ] Online/offline status (real-time via WebSocket)
- [ ] 1-on-1 messaging (WebSocket for send/receive)
- [ ] Typing indicators (WebSocket broadcast)
- [ ] Message persistence (Postgres via Prisma)
- [ ] Message history retrieval (tRPC)
- [ ] No friend system - open chat for all users

## Code Quality Rules
- TypeScript strict mode
- Prisma migrations for schema changes
- tRPC procedures with Zod validation
- WebSocket event typing (shared types client/server)
- Error handling on all async operations
- Optimistic UI updates for messages

## Performance Requirements
- Lazy load message history (pagination via tRPC)
- WebSocket reconnection logic with exponential backoff
- Debounce typing indicators (300ms)
- Index database queries (userId, timestamp on messages)

## File Structure
```
/src
  /app - Next.js routes
  /components - shadcn/ui + custom
  /server - tRPC routers + WebSocket server
  /lib - Prisma client, auth config, utils
  /types - Shared TypeScript types
```

## Development Workflow
1. Design review → identify shadcn blocks/components
2. Database schema → Prisma migration
3. tRPC routes → API endpoints
4. WebSocket events → real-time layer
5. UI implementation → shadcn-first approach
6. Test real-time features → manual + automated

**Non-negotiable**: If a shadcn block exists for the UI pattern, use it. Custom only when unavoidable.