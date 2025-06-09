# Taski — ultimate selfhosted opensource project management application

The ultimate selfhosted opensource project management application built with the T3 Stack, featuring OAuth authentication, project boards, and integrated wiki functionality.

![Taski](./media/Self-Hosted%20Project%20Management.jpeg)

## Features

- **Project Management**: Create and manage projects with Kanban-style boards
- **OAuth Authentication**: Secure login with OAuth providers
- **Collaborative Boards**: Share boards with team members
- **Integrated Wiki**: Built-in wiki pages for project documentation
- **User Management**: Profile settings and member management
- **Real-time Updates**: Modern, responsive interface with real-time collaboration

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: tRPC, Better Auth
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI primitives
- **Development**: TypeScript, Biome (linting/formatting)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taski
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and OAuth credentials
   ```

4. **Start the database**
   ```bash
   ./start-database.sh
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations
- `npm run check` - Run linting and formatting checks

## Deployment

The application can be deployed on any platform that supports Next.js applications. Make sure to:

1. Set up your production database
2. Configure environment variables
3. Run database migrations
4. Build and deploy the application

## License

This project is private and not intended for public distribution.
