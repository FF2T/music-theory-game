import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100">
          <h1 className="text-2xl font-bold mb-4">Oups, une erreur est survenue</h1>
          <pre className="text-sm bg-white dark:bg-black/40 p-4 rounded-xl max-w-2xl overflow-auto whitespace-pre-wrap">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Recharger
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
