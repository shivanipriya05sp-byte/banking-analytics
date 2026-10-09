interface ErrorMessageProps {
  message?: string
}

export default function ErrorMessage({ message = 'Failed to load data.' }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center h-32 text-red-500 text-sm">
      ⚠ {message}
    </div>
  )
}
