import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthButtons } from '~/app/_components/auth-buttons'
import { auth } from '~/server/auth'
import { HydrateClient, api } from '~/trpc/server'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If user is authenticated, check organization and redirect
  if (session?.user) {
    const organization = await api.organization.get()

    if (!organization) {
      redirect('/setup')
    } else {
      redirect('/dashboard')
    }
  }

  // Landing page for unauthenticated users
  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Self-Hosted
              <span className="text-blue-600 block">Project Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A powerful combination of Trello-like boards and team wiki for your organization.
              Manage projects, track tasks, and document knowledge all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <AuthButtons />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Kanban Boards</h3>
              <p className="text-gray-600">
                Organize your work with intuitive drag-and-drop boards. Create lists, add cards,
                assign team members, and track progress.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Team Wiki</h3>
              <p className="text-gray-600">
                Document your processes, share knowledge, and keep your team aligned with a powerful
                wiki system.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Invite team members, assign tasks, leave comments, and collaborate effectively on
                all your projects.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Self-Hosted</h3>
              <p className="text-gray-600">
                Keep your data private and secure. Host on your own infrastructure with complete
                control over your information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  )
}
