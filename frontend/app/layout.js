import './globals.css'

export const metadata = {
  title: 'AI 3D Prototyping',
  description: 'AI-powered 3D prototyping platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
