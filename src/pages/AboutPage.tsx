import { Brain, Dna, Microscope, Zap, Users, Award, TrendingUp, Shield } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="w-12 h-12" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning models for accurate protein classification and prediction",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Dna className="w-12 h-12" />,
      title: "Sequence Generation",
      description: "Generate optimized protein variants with similarity scoring and ranking",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Microscope className="w-12 h-12" />,
      title: "Molecular Docking",
      description: "Predict drug-protein binding affinity with AutoDock Vina integration",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Real-time Processing",
      description: "Fast, efficient analysis with instant results and visualizations",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const stats = [
    { label: "Accuracy", value: "97%", icon: <Award className="w-6 h-6" /> },
    { label: "Models", value: "8+", icon: <Brain className="w-6 h-6" /> },
    { label: "Users", value: "1K+", icon: <Users className="w-6 h-6" /> },
    { label: "Uptime", value: "99.9%", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  return (
    <div className="page-container min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-12 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="inline-block p-3 bg-blue-500/20 rounded-2xl mb-4">
            <Shield className="w-16 h-16 text-blue-300" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">About Insulin Drug Synthesis</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Revolutionizing drug discovery through advanced AI and computational biology
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card-hover bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-3 text-blue-300">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-blue-200">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-hover bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 animate-fadeIn"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-blue-200 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-16 animate-fadeInUp">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Backend</h3>
              <p className="text-blue-200 text-sm">Python • Flask • PyTorch • NumPy</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Frontend</h3>
              <p className="text-blue-200 text-sm">React • TypeScript • Tailwind CSS</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">AI/ML</h3>
              <p className="text-blue-200 text-sm">ProteinLM • MLP • AlphaFold2 • AutoDock</p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center animate-fadeInUp">
          <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-blue-100 text-lg max-w-4xl mx-auto leading-relaxed">
            To democratize access to cutting-edge computational drug discovery tools, empowering researchers worldwide 
            to accelerate the development of life-saving therapeutics through the power of artificial intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}

