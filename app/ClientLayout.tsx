"use client"

import type React from "react"

import { useState, useEffect } from "react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme)
  }, [theme])

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
        {children}
        <script
          src="https://cdn.jsdelivr.net/npm/boosted@5.3.2/dist/js/boosted.bundle.min.js"
          integrity="sha384-+lAXqnipqQpjxMdd/9Hp2GOzB4aIoU9NHU7LF2+GP5MCJwrxSu+QB9lFM9LguyT3"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  )
}

