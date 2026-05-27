import { Link } from 'react-router-dom'
import logoUrl from '../../../Affordable_logo.jpeg'

export default function Footer() {
  return (
    <footer className="bg-black-primary text-ivory mt-20">
      <div className="container-base py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-nude/30 to-transparent blur-md" />
                <img
                  src={logoUrl}
                  alt="AH&M"
                  className="relative h-14 w-14 md:h-16 md:w-16 rounded-full object-cover ring-2 ring-white/10 bg-white"
                />
              </div>
              <div className="flex flex-col leading-tight pt-1">
                <span className="text-2xl md:text-3xl font-heading font-bold tracking-tight">AH&amp;M</span>
                <span className="text-[10px] md:text-xs tracking-[0.2em] text-white/40 uppercase font-medium">
                  Affordable Hair &amp; More
                </span>
              </div>
            </div>
            <p className="text-sm text-white/70">Premium hair, wigs, and beauty essentials.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-gold transition">All Products</Link></li>
              <li><Link to="/products" className="hover:text-gold transition">New Arrivals</Link></li>
              <li><Link to="/products" className="hover:text-gold transition">Trending</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-gold transition">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition">Contact Us</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition">Shipping Info</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-gold transition">Privacy</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition">Terms</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition">Returns</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center gap-4 text-center md:text-left text-sm text-white/70">
          <p>&copy; 2024 Affordable Hair and More. All rights reserved.</p>
          <div className="flex gap-4 md:ml-auto">
            <a href="https://instagram.com/affordablehairandmoregh" className="hover:text-gold transition">Instagram</a>
            <a href="#" className="hover:text-gold transition">TikTok</a>
            <a href="tel:0243368136" className="hover:text-gold transition">0243368136</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
