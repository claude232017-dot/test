"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
          <AlertTriangle className="w-7 h-7 text-yellow-400/60" />
          <p className="text-xs text-muted-foreground">Something went wrong</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
