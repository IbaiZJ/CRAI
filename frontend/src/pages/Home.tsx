import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Cpu, 
  Bell, 
  BarChart3, 
  ChevronRight, 
  ShieldCheck, 
  Activity
} from 'lucide-react';

// --- Components ---

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'CRAI - Home';
}

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
};

const Button = ({ children, variant = 'primary', className = '', onClick }: { children: React.ReactNode, variant?: 'primary' | 'secondary' | 'outline', className?: string, onClick?: () => void }) => {
  const baseStyle = "px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 group";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:border-blue-200 hover:text-blue-600 shadow-sm hover:shadow-md",
    outline: "border-2 border-white text-white hover:bg-white/10"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- Custom Illustrations ---

const HeroIllustration = () => (
  <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
    {/* Abstract City Grid */}
    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-4 opacity-10 transform perspective-1000 rotate-x-12">
      {[...new Array(36)].map((_, i) => (
        <div key={`city-grid-cell-${i}`} className="bg-blue-500 rounded-lg h-full w-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
    <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 w-80 z-10 animate-float">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Camera className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <div className="h-2 w-24 bg-gray-200 rounded mb-1"></div>
          <div className="h-2 w-16 bg-gray-100 rounded"></div>
        </div>
      </div>
      
      {/* Simulated Video Feed */}
      <div className="h-40 bg-gray-100 rounded-xl mb-4 relative overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-300 text-xs font-mono">LIVE FEED: CAM-04</span>
        </div>
        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-scan"></div>
        
        {/* Bounding Box */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-16 border-2 border-blue-500 rounded flex items-center justify-center bg-blue-500/10">
           <div className="absolute -top-3 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
             ABC-1234
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-xs text-gray-500 font-medium">Tracking Active</span>
        </div>
        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">99.8% Conf.</span>
      </div>
    </div>

    {/* Floating Elements */}
    <div className="absolute top-10 right-10 bg-white p-3 rounded-2xl shadow-xl animate-float-delayed flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-green-600" />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-800">Verified</p>
            <p className="text-[10px] text-gray-400">Just now</p>
        </div>
    </div>
    
    <div className="absolute bottom-20 left-0 bg-white p-3 rounded-2xl shadow-xl animate-float flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Activity className="w-4 h-4 text-purple-600" />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-800">Analysis</p>
            <p className="text-[10px] text-gray-400">Processing...</p>
        </div>
    </div>
  </div>
);

// --- Main Sections ---

const Hero = () => (
  <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-slate-50">
    {/* Background Elements */}
    <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-b from-blue-50 to-transparent opacity-60 rounded-bl-[100px] -z-10"></div>
    <div className="absolute top-1/3 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div className="absolute top-1/3 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

    <div className="container mx-auto px-8">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="lg:w-1/2">
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Next Gen ANPR Technology</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Smarter cities start with <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">intelligent vision.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              Real-time license plate recognition and vehicle analytics powered by advanced AI. Centralize your city's monitoring infrastructure in one beautiful cloud dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className='cursor-pointer' onClick={() => (globalThis.location.href = '/dashboard')}>
                Get Started <ChevronRight className="w-4 h-4" />
              </Button>
              <Button className='cursor-pointer' variant="secondary">
                View Documentation
              </Button>
            </div>
          </FadeIn>
        </div>
        <div className="lg:w-1/2 w-full">
          <FadeIn delay={300}>
            <HeroIllustration />
          </FadeIn>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    {
      icon: <Camera className="w-6 h-6 text-blue-600" />,
      title: "Multi-Camera Sync",
      desc: "Connect thousands of video streams across the city. CRAI unifies scattered feeds into a single coherent data layer."
    },
    {
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
      title: "Edge & Cloud AI",
      desc: "Hybrid processing ensures ultra-low latency detection while maintaining historical data depth in the cloud."
    },
    {
      icon: <Bell className="w-6 h-6 text-cyan-600" />,
      title: "Instant Alerts",
      desc: "Set watchlists for stolen vehicles or VIPs. Receive push notifications the second a match is detected."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-violet-600" />,
      title: "Traffic Analytics",
      desc: "Go beyond plates. Understand traffic flow, peak hours, and vehicle make/model distribution trends."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="container mx-auto px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Precision at Scale</h2>
          <p className="text-slate-500 text-lg">
            Built for scalability, accuracy, and ease of use. CRAI transforms raw video footage into actionable intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={feature.title} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};



const DashboardPreview = () => (
    <section id="analytics" className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-8">
            <div className="flex flex-col items-center text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">A Command Center for the Modern City</h2>
                <p className="text-slate-500 max-w-2xl">Visualise traffic patterns, search historical logs by partial plate numbers, and manage your entire camera network from one intuitive interface.</p>
            </div>
            
            <div className="relative mx-auto max-w-5xl">
                {/* Decorative Glow */}
                <div className="absolute -inset-1 bg-linear-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-20"></div>
                
                {/* Browser Window Mockup */}
                <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="ml-4 w-64 h-6 bg-white rounded-md border border-slate-200 text-xs flex items-center px-2 text-slate-400">crai.io/dashboard/analytics</div>
                    </div>
                    
                    {/* Abstract UI Representation */}
                    <div className="p-6 grid grid-cols-12 gap-6 bg-slate-50/50">
                        {/* Sidebar */}
                        <div className="col-span-2 hidden md:block space-y-4">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className={`h-8 w-full rounded-lg ${i===1 ? 'bg-blue-100' : 'bg-slate-200/50'}`}></div>
                            ))}
                        </div>
                        
                        {/* Main Content */}
                        <div className="col-span-12 md:col-span-10 grid grid-cols-3 gap-6">
                             {/* Stats Cards */}
                             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                 <div className="h-2 w-12 bg-slate-200 rounded mb-2"></div>
                                 <div className="h-8 w-24 bg-blue-500/10 rounded mb-1"></div>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                 <div className="h-2 w-12 bg-slate-200 rounded mb-2"></div>
                                 <div className="h-8 w-24 bg-cyan-500/10 rounded mb-1"></div>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                 <div className="h-2 w-12 bg-slate-200 rounded mb-2"></div>
                                 <div className="h-8 w-24 bg-purple-500/10 rounded mb-1"></div>
                             </div>

                             {/* Chart Area */}
                             <div className="col-span-3 bg-white h-64 rounded-xl border border-slate-100 shadow-sm flex items-end justify-between p-6 gap-2">
                                {[35, 55, 40, 70, 60, 85, 95, 75, 50, 65, 80, 60].map((h, i) => (
                                    <div key={`chart-bar-${i}-${h}`} className="w-full bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{height: `${h}%`}}></div>
                                ))}
                             </div>

                             {/* Table Area */}
                             <div className="col-span-3 bg-white h-32 rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
                                {[1,2,3].map(i => (
                                    <div key={`table-row-${i}`} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                                        <div className="h-3 w-32 bg-slate-100 rounded"></div>
                                        <div className="h-3 w-20 bg-slate-100 rounded"></div>
                                        <div className="h-3 w-10 bg-green-100 rounded"></div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
)

// const CTA = () => (
//   <section className="py-24 bg-white">
//     <div className="container mx-auto px-8">
//       <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
//         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
//             <svg width="100%" height="100%">
//                 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//                     <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
//                 </pattern>
//                 <rect width="100%" height="100%" fill="url(#grid)" />
//             </svg>
//         </div>
        
//         <div className="relative z-10 max-w-3xl mx-auto">
//           <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to modernize your infrastructure?</h2>
//           <p className="text-blue-100 text-lg mb-10">Join forward-thinking cities and private campuses using CRAI for safer, smarter monitoring.</p>
//           <div className="flex flex-col sm:flex-row justify-center gap-4">
//             <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1">
//                 Get Started Now
//             </button>
//             <button className="px-8 py-4 border border-blue-400 bg-blue-700/30 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
//                 Contact Sales
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>
// );

// const Footer = () => (
//   <footer className="bg-slate-50 border-t border-slate-200 py-12">
//     <div className="container mx-auto px-8">
//       <div className="grid md:grid-cols-4 gap-8 mb-8">
//         <div className="col-span-1 md:col-span-1">
//           <div className="flex items-center gap-2 mb-4">
//             <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">C</div>
//             <span className="text-lg font-bold text-slate-900">CRAI</span>
//           </div>
//           <p className="text-slate-500 text-sm">
//             AI-powered intelligence for the physical world.
//           </p>
//         </div>
        
//         <div>
//           <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
//           <ul className="space-y-2 text-sm text-slate-500">
//             <li><a href="#" className="hover:text-blue-600">Features</a></li>
//             <li><a href="#" className="hover:text-blue-600">Integrations</a></li>
//             <li><a href="#" className="hover:text-blue-600">Hardware</a></li>
//             <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
//           </ul>
//         </div>
        
//         <div>
//           <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
//           <ul className="space-y-2 text-sm text-slate-500">
//             <li><a href="#" className="hover:text-blue-600">Documentation</a></li>
//             <li><a href="#" className="hover:text-blue-600">API Reference</a></li>
//             <li><a href="#" className="hover:text-blue-600">Community</a></li>
//             <li><a href="#" className="hover:text-blue-600">Blog</a></li>
//           </ul>
//         </div>
        
//         <div>
//           <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
//           <ul className="space-y-2 text-sm text-slate-500">
//             <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
//             <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
//             <li><a href="#" className="hover:text-blue-600">Security</a></li>
//           </ul>
//         </div>
//       </div>
      
//       <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
//         <p className="text-slate-400 text-sm">© 2024 CRAI Systems Inc. All rights reserved.</p>
//         <div className="flex gap-4 mt-4 md:mt-0">
//             {/* Social placeholders */}
//             <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer"></div>
//             <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer"></div>
//             <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer"></div>
//         </div>
//       </div>
//     </div>
//   </footer>
// );

const App = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Hero />
      <Features />
      {/* <HowItWorks /> */}
      <DashboardPreview />
      {/* <CTA /> */}
      {/* <Footer /> */}
      
      {/* Custom Styles for specific animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 3s;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}} />
    </div>
  );
};

export default App;