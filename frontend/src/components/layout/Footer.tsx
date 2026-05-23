export default function Footer() {
  return (
    <footer className="bg-black-primary text-ivory mt-20">
      <div className="container-base py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-heading font-semibold mb-4">Wiggle</h3>
            <p className="text-sm text-opacity-75">Premium luxury wigs and beauty products.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gold">All Products</a></li>
              <li><a href="#" className="hover:text-gold">New Arrivals</a></li>
              <li><a href="#" className="hover:text-gold">Trending</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gold">Help Center</a></li>
              <li><a href="#" className="hover:text-gold">Contact Us</a></li>
              <li><a href="#" className="hover:text-gold">Shipping Info</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gold">Privacy</a></li>
              <li><a href="#" className="hover:text-gold">Terms</a></li>
              <li><a href="#" className="hover:text-gold">Returns</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory border-opacity-10 pt-8 flex-between text-sm text-opacity-75">
          <p>&copy; 2024 Wiggle. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gold">Instagram</a>
            <a href="#" className="hover:text-gold">TikTok</a>
            <a href="#" className="hover:text-gold">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
