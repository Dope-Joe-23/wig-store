import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black-primary text-ivory mt-20">
      <div className="container-base py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-heading font-semibold mb-4">Wiggle</h3>
            <p className="text-sm text-white/70">Premium luxury wigs and beauty products.</p>
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
          <p>&copy; 2024 Wiggle. All rights reserved.</p>
          <div className="flex gap-4 md:ml-auto">
            <a href="#" className="hover:text-gold transition">Instagram</a>
            <a href="#" className="hover:text-gold transition">TikTok</a>
            <a href="#" className="hover:text-gold transition">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
