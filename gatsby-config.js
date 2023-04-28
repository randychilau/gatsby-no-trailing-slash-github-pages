/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `example site`,
    siteUrl: `https://www.yourdomain.tld`
  },
  trailingSlash: "never",
  pathPrefix: "/gatsby-no-trailing-slash",
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
          return {
            url: matchPath ? matchPath : path,
            changefreq: "daily",
            priority: 0.7,
          };
        },
      },
    },

  ]
};