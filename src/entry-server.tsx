import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import App from './App';
import { ScrollToTop } from './components/ScrollToTop';
import { blogPosts } from './data/blogPosts';

export const prerenderRoutes = ['/', ...blogPosts.map(post => `/blog/${post.slug}`)];
export const postMeta = blogPosts.map(post => ({
  slug: post.slug,
  date: post.date,
}));

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <ScrollToTop />
        <App />
      </StaticRouter>
    </HelmetProvider>
  );

  return {
    html,
    helmet: helmetContext.helmet,
  };
}
