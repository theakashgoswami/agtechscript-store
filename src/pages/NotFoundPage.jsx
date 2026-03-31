import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 text-center px-4">
      <div className="relative">
        <span className="font-black text-[120px] md:text-[160px] leading-none select-none"
          style={{ color:"rgba(0,71,255,0.07)" }}>
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-5xl">🔍</span>
      </div>
      <div>
        <h1 className="font-bold text-2xl text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/"
          className="px-6 py-2.5 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          style={{ background:"linear-gradient(135deg,#0047ff,#0033ad)", boxShadow:"0 4px 15px rgba(0,71,255,0.35)" }}>
          Go Home
        </Link>
        <button onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );
}
