/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  pathPrefix: "/gatsby-no-trailing-slash-github-pages",
  siteMetadata: {
    title: "Gatsby No Trailing Slash Site on GitHub Pages",
    siteUrl: "https://randychilau.github.io/gatsby-no-trailing-slash-github-pages"
  },
  trailingSlash: "never",
  plugins: [
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        query: `
        {
          allSitePage {
            nodes {
              path
              matchPath
            }
          }
          site {
            siteMetadata {
              siteUrl
              }
          }
        }
      `,
      resolveSiteUrl: ({ site: { siteMetadata: { siteUrl } } }) => siteUrl,
      resolvePages: ({
        allSitePage: { nodes: allPages },
      }) => {
        return allPages.map(page => {
          return { ...page };
        });
      },
      serialize: ({ path, matchPath }) => {
        let url = matchPath ? matchPath : path;
        url = url.startsWith("/") ? url : `/${url}`;
        return {
          url: url,
          changefreq: "daily",
          priority: 0.7,
        };
      },
    }, 
  }   
  ]
};

