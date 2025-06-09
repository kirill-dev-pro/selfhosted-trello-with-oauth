'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export function DeploymentOptions() {
  const deploymentOptions = [
    {
      icon: '🏠',
      title: 'Self-Hosted',
      description: 'Deploy on your own infrastructure for complete control',
      features: [
        'Full data ownership and control',
        'Deploy anywhere - Docker, VPS, cloud',
        'Custom configurations and integrations',
        'No external dependencies',
        'Perfect for compliance requirements',
      ],
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: '☁️',
      title: 'Hosted Version',
      description: 'Use our managed hosting with your own OAuth OIDC provider',
      features: [
        'Managed infrastructure and updates',
        'Bring your own OAuth OIDC provider',
        'Free identity management with Klaud.me',
        'High availability and backups',
        'Focus on your work, not maintenance',
      ],
      gradient: 'from-blue-500 to-purple-500',
    },
  ]

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Deploy Your Way
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose between self-hosting for complete control or our hosted version with your own
            OAuth OIDC provider. Both options are completely free forever.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {deploymentOptions.map((option, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4">{option.icon}</div>
                <CardTitle className="text-2xl mb-2 text-white">{option.title}</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center">
                  <a
                    href={index === 0 ? '/docs/setup-selfhosting.md' : '/docs/setup-klaud.md'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    {index === 0 ? 'Setup Self-Hosting' : 'Setup with Klaud.me'}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Klaud.me Sponsorship Callout */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-400/20">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Powered by <span className="text-blue-400">Klaud.me</span>
              </h3>
              <p className="text-gray-200 text-lg mb-6">
                This project is proudly sponsored by Klaud.me, providing free OAuth OIDC identity
                management. Create your identity provider in minutes and integrate it seamlessly
                with Taski.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://klaud.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Get Free Identity Provider
                </a>
                <a
                  href="/docs/setup-klaud.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Klaud Setup Guide
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
