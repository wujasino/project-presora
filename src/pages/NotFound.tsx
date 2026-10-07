import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404:', location.pathname);
  }, [location.pathname]);

  return (
    <FloatingPathsBackground position={1} className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-md"
      >
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
          className="text-[9rem] font-display leading-none text-primary/10 select-none mb-2"
        >
          404
        </motion.div>

        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 -mt-4">
          <Search className="w-7 h-7 text-primary" />
        </div>

        <h1 className="text-2xl font-display text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          The address <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs">{location.pathname}</code> does not
          exist or has been moved. Check the URL or go back to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </FloatingPathsBackground>
  );
}
