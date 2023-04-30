/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  pathPrefix: "/gatsby-no-trailing-slash-github-pages",
  siteMetadata: {
    title: "Gatsby No Trailing Slash Site on GitHub Pages",
    siteUrl: "https://randychilau.github.io/",
    description: "Working example of Gatsby site on GitHub Pages with no-trailing-slash"
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
      serialize: ({ path, matchPath, site: { siteMetadata: { siteUrl } } }) => {
        let url = matchPath ? matchPath : path;
        if (url === siteUrl) return
        url = url.startsWith("/") ? url : `/${url}`;
        url= url.endsWith("/") ? url.replace(/\/$/, "") : url
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

