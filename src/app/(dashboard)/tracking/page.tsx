import dynamic from 'next/dynamic'

const TrackingComponent = dynamic(() => import('@/components/tracking/tracking-map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
})

const page = () => {
  return (
    <div className="container mx-auto p-4">
      <TrackingComponent />
    </div>
  )
}

export default page