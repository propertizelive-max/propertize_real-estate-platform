import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light px-4">
      <h1 className="text-4xl font-bold text-primary mb-4">404 - Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
        Back to Home
      </Link>
    </div>
  )
}
