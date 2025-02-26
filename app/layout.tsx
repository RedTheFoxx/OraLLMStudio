import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { AgentProvider } from "./AgentContext"

export const metadata: Metadata = {
  title: "LLM Studio @ DSF",
  description: "Un chatbot centré autour du principe d'assistants et d'agents.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/boosted@5.3.2/dist/css/boosted.min.css"
          rel="stylesheet"
          integrity="sha384-fyenpx19UpfUhZ+SD9o9IdxeIJKE6upKx0B54OcXy1TqnO660Qw9xw6rOASP+eir"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AgentProvider>
          <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
              <div className="container-fluid">
                <Link href="/" className="navbar-brand">
                  <img
                    src="https://boosted.orange.com/docs/5.3/assets/brand/orange-logo.svg"
                    width="50"
                    height="50"
                    alt="Orange logo"
                  />
                  <span className="ms-3 text-white">LLM Studio</span>
                </Link>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                  aria-controls="navbarNav"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <Link href="/" className="nav-link text-white">
                        Accueil
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/agents-studio" className="nav-link text-white">
                        Studio agents
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </header>
          {children}
          <script
            src="https://cdn.jsdelivr.net/npm/boosted@5.3.2/dist/js/boosted.bundle.min.js"
            integrity="sha384-+lAXqnipqQpjxMdd/9Hp2GOzB4aIoU9NHU7LF2+GP5MCJwrxSu+QB9lFM9LguyT3"
            crossOrigin="anonymous"
          ></script>
        </AgentProvider>
      </body>
    </html>
  )
}



import './globals.css'