import { Routes, Route, Link } from 'react-router-dom';
import { BlogPost } from './components/BlogPost';
import { ExperimentCard } from './components/ExperimentCard';
import { RealtimeClock } from './components/RealtimeClock';
import { Seo } from './components/Seo';
import { siteMetadata } from './data/siteMetadata';
import { blogPosts } from './data/blogPosts';

function HomePage() {
  const description =
    "Marketer who taught himself to code, building AI agents and products like typesm.art. Based in Delhi, India.";

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteMetadata.author,
    url: siteMetadata.siteUrl,
    description,
    sameAs: [
      'https://x.com/anthropiast',
      'https://github.com/nimish-html',
      'https://www.linkedin.com/in/nimish-gahlot/',
      'https://www.typesm.art/',
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-gray-900 leading-relaxed">
      <Seo title={siteMetadata.title} description={description} path="/" jsonLd={jsonLd} />
      <div className="max-w-2xl mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/me.png" 
              alt="nimish gahlot" 
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-normal mb-1">nimish gahlot</h1>
              <p className="text-sm text-gray-600">
                delhi, in. <RealtimeClock />
              </p>
            </div>
          </div>
        </header>

        {/* About */}
        <section className="mb-12">
          <p className="mb-4 text-sm leading-6">
            i'm a marketer who taught myself to code. <br></br> i spend all my time playing w/ llms, and building agents. <br></br>
            obsessed with the small details, and running long distances.
          </p>
          <p className="mb-4 text-sm leading-6">
            building{' '}
            <a href="https://www.typesm.art/" className="underline hover:no-underline transition-all duration-150 hover:text-gray-900 hover:font-medium" target="_blank" rel="noreferrer">typesm.art</a>
            {' '}- a content automation platform that automatically repurposes your x content for linkedin and bluesky. <br></br>
            soon, we are expanding it to other social platforms, blogs, yt videos and more.
          </p>
        </section>

        {/* About Me */}
        <section className="mb-12">
          <h2 className="text-sm mb-6 text-gray-900 font-medium tracking-wide relative group">
            <span className="relative">
              about me
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </h2>
          <p className="mb-4 text-sm leading-6">
            i graduated from iit bombay in 2021, since then i have been working closely with founders to scale their products.
          </p>
          <p className="text-sm leading-6">
          last year, i took the leap of faith to start my own startup but realised that starting up as a non tech founder is a significant disadvantage.<br></br>
          so i learnt how to code in the last 12 mos, and now i have my own app (typesm.art) and customers who pay to use my code :)
          </p>
        </section>

        {/* Experiments */}
        <section className="mb-12">
          <h2 className="text-sm mb-6 text-gray-900 font-medium tracking-wide relative group">
            <span className="relative">
              experiments
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </h2>
          <p className="mb-6 text-sm leading-6">
            some explorations with ai
          </p>
          
          <div className="space-y-4">

          <ExperimentCard
              title="PerfectSync"
              description="a tool that fixes audio errors of recorded videos. built with React, Anthropic and ElevenLabs."
              year="2025"
              previewImage="/perfect-sync.png"
              previewAlt="perfectsync interface"
              url="https://preview--perfect-sync.lovable.app/"
            />
          

            <ExperimentCard
              title="Bolt Hackathon Website"
              description="my entry for the Bolt's hackathon website contest. it was one of the runner ups. built entirely with Bolt and Cursor."
              year="2025"
              previewImage="/bolt-hackathon-lp.png"
              previewAlt="bolt hackathon website contest entry"
              url="https://bolt-hackathon-site.netlify.app/"
            />
            
            <ExperimentCard
              title="SketchMind"
              description="a tool that translates live group calls into visualisations like flow charts and mind maps. built with React, OpenAI and MermaidJS."
              year="2025"
              previewImage="/sketchmind.png"
              previewAlt="sketchmind interface"
              url="https://sketchmind.me/"
            />
          </div>
        </section>

        {/* Blog */}
        <section className="mb-12">
          <h2 className="text-sm mb-6 text-gray-900 font-medium tracking-wide relative group">
            <span className="relative">
              blog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </h2>
          <p className="mb-6 text-sm leading-6">
            i blog about things i'm learning, my experiences, my thoughts on technology, and life.
          </p>
          
          <div className="space-y-3">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="flex justify-between items-center cursor-pointer transition-all duration-200 hover:text-gray-900 hover:font-medium p-3 -m-3 rounded-lg hover:bg-gray-100 hover:shadow-sm transform hover:scale-[1.01] block"
              >
                <span className="text-sm transition-all duration-150">{post.title}</span>
                <span className="text-xs text-gray-500">{post.date}</span>
              </Link>
            ))}
          </div>
        </section>


        {/* Connect */}
        <section className="mb-12">
          <h2 className="text-sm mb-6 text-gray-900 font-medium tracking-wide relative group">
            <span className="relative">
              connect
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </h2>
          <p className="text-sm leading-6">
            contact me on{' '}
            <a href="https://x.com/anthropiast" className="underline hover:no-underline transition-all duration-150 hover:text-gray-900 hover:font-medium">X</a>{' '}
            <a href="https://github.com/nimish-html" className="underline hover:no-underline transition-all duration-150 hover:text-gray-900 hover:font-medium">GitHub</a>{' '}
            <a href="https://www.linkedin.com/in/nimish-gahlot/" className="underline hover:no-underline transition-all duration-150 hover:text-gray-900 hover:font-medium">LinkedIn</a>{' '}
            - or send me an email at{' '}
            <a href="mailto:nimish@nimishbuilds.xyz" className="underline hover:no-underline transition-all duration-150 hover:text-gray-900 hover:font-medium">nimish@nimishbuilds.xyz</a>
          </p>
        </section>

        {/* Colophon */}
        <section className="mb-12">
          <h2 className="text-sm mb-6 text-gray-900 font-medium tracking-wide relative group">
            <span className="relative">
              colophon
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </span>
          </h2>
          <p className="text-sm leading-6">
            built with vite. started as a project in bolt, finished with cursor. <br></br> 100% vibe coded and open sourced — fork it{' '}
            <a href="https://github.com/nimish-html/minimal-portfolio.git" className="underline hover:no-underline transition-all duration-150 hover:text-gray-900 hover:font-medium" target="_blank" rel="noreferrer">here</a>.
          </p>
        </section>

      </div>
      
      {/* Signature Footer */}
      <footer className="max-w-2xl mx-auto px-6 pb-8">
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs text-gray-400">created with</span>
            <span className="text-xs text-gray-400">🤍</span>
            <span className="text-xs text-gray-400">by</span>
            <img 
              src="/nimish_signature_horizontal.png" 
              alt="nimish signature" 
              className="h-14 opacity-60 hover:opacity-80 transition-opacity duration-200"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
    </Routes>
  );
}

export default App;
