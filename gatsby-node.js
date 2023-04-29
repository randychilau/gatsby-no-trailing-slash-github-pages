const path = require("path");
const { exists, writeFile, ensureDir } = require("fs-extra");

// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
// The env conditional is for GitHub Pages
if (process.env.CI) {

  // Replacing '/' would result in empty string which is invalid
  const replacePath = (path) => (path === "/" || path.includes("/404")) ? path : `${path}.html`;

  exports.onCreatePage = ({ page, actions }) => {
    const { createPage, deletePage, createRedirect } = actions;
    const oldPage = Object.assign({}, page);
    page.matchPath = page.path;
    page.path = replacePath(page.path);

    if (page.path !== oldPage.path) {
    // Replace new page with old page
      deletePage(oldPage);
      createPage(page);

      createRedirect({ fromPath: `/${page.matchPath}/`, toPath: `/${page.matchPath}`, redirectInBrowser: true, isPermanent: true });
    }
  };
}

/*
MIT License

Copyright (c) 2018 Get Chalk
*/


async function writeRedirectsFile(redirects, folder, pathPrefix, siteUrl) {

  if (!redirects.length) return;

  for (const redirect of redirects) {
    const { fromPath, toPath } = redirect;

    const FILE_PATH = path.join(
      folder,
      fromPath.replace(pathPrefix, ""),
      "index.html"
    );

    const fileExists = await exists(FILE_PATH);
    if (!fileExists) {
      try {
        await ensureDir(path.dirname(FILE_PATH));
      } catch (err) {
        // ignore if the directory already exists;
      }

      const data = getMetaRedirect(toPath, pathPrefix, siteUrl);
      await writeFile(FILE_PATH, data);
    }
  }
}

// this function creates the index.html file with the refresh redirect

function getMetaRedirect(toPath, pathPrefix, siteUrl) {

  const ci = process.env.CI;
  let url = toPath.replace(pathPrefix, "").trim();
  const hasProtocol = url.includes("://");
  if (!hasProtocol) {
    const hasLeadingSlash = url.startsWith("/");
    if (!hasLeadingSlash) {
      url = `/${url}`;
    }
    const resemblesFile = url.includes(".");
       /*modified for GitHub Pages due to url handling, more info
    https://slorber.github.io/trailing-slash-guide/.
    original code:
    url = `${url}/`.replace(/\/\/+/g, '/');
    */
    if (!resemblesFile) {
      url = ci
        ? url = `${url}`.replace(/\/\/+/g, "/")
        : url = `${url}/`.replace(/\/\/+/g, "/");
    }
  }
  const metaRefresh = `<meta http-equiv="refresh" content="0; URL='${pathPrefix}${url}'" />`;
  const metaCanonical =  `<link rel="canonical" href="${siteUrl}${url}" />`;
  return metaRefresh + metaCanonical;
};

//using onPostBuild, the redirects are processed to create the folders and index.html files that redirect to the pages created during onCreatePages

exports.onPostBuild = ({ store }) => {
  const { redirects, program, config } = store.getState();

  let pathPrefix = "";
  if (program.prefixPaths) {
    pathPrefix = config.pathPrefix;
  }

  const siteUrl = config.siteMetadata.siteUrl;
  const folder = path.join(program.directory, "public");
  
  return writeRedirectsFile(redirects, folder, pathPrefix, siteUrl);
};

/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
