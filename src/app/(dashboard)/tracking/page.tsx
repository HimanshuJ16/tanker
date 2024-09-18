// app/(dashboard)/tracking/page.tsx
import dynamic from 'next/dynamic'

const TrackingComponent = dynamic(() => import('@/components/tracking/TrackingComponent'), {
  ssr: false,
  loading: () => <p>Loading tracking component...</p>
})

export default function TrackingPage() {
  return (
    <div className="container mx-auto p-4">
      <TrackingComponent />
    </div>
  )
}