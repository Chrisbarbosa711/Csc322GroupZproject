import { Button } from "@/components/ui/button"
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen w-[100vw]">
      <Navbar />
      <div className="container mx-auto px-4 pt-12 flex justify-center">
        <div className="max-w-2xl text-center">
          {/* Hero Section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              More than an Editor.
            </h2>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Enhance your{' '}
              <span className="text-primary">LLM experience.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Our LLM Editor helps developers and researchers work more efficiently with large language models,
              providing powerful tools and intuitive interfaces.
            </p>
            
            <div className="flex space-x-4 justify-center">
              <Button>Try Workspace</Button>
              <Button>Sign Up</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 