import Hero from '@/components/home/Hero'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import TrustStrip from '@/components/home/TrustStrip'
import MayoreoBanner from '@/components/home/MayoreoBanner'
import StripeSeal from '@/components/home/StripeSeal'
import Testimonials from '@/components/home/Testimonials'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <MayoreoBanner />
      <StripeSeal />
      <Testimonials />
    </>
  )
}
