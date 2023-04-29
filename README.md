<h1>
 Example of Gatsby Site hosted on GitHub Pages without a trailing slash in the url (including the sitemap)
</h1>

Credit:
[slorber](https://github.com/slorber)
[jon-sully](https://github.com/jon-sully)
[gatsby-plugin-meta-redirect](https://github.com/nsresulta/gatsby-plugin-meta-redirect)
Gatsby Team, [everyone on "the thread"](https://github.com/gatsbyjs/gatsby/discussions/34205), and ChatGPT for pointing me in a direction I wasn't considering.

---

Notes:

- This issue may not be relevant anymore as some may have moved on from hosting on GitHub Pages or changed their stance on trailing-slash vs no-trailing-slash. For those interested in a working example, hopefully this is helpful.
- There may be some aspects of this example that are not "best practice" or unnecessary because Gatsby may already handle it. Please feel free to provide feedback in the comments to help improve the method, as well as increase the readability of this README.

---

This method involves the following items

from Gatsby:

1. [`page.path` and `page.matchPath` properties](https://www.gatsbyjs.com/docs/gatsby-internals-terminology/)
2. [`onCreatePage` API](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onCreatePage)
3. [`createRedirect`](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createRedirect)
4. a modified version of [`gatsby-plugin-meta-redirect`](https://www.gatsbyjs.com/plugins/gatsby-plugin-meta-redirect/)
5. update settings for [`gatsby-plugin-sitemap`](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/)
6. [`trailingSlash`](https://www.gatsbyjs.com/docs/reference/release-notes/v4.7/#trailingslash-option)

from GitHub:

1.  CI environment variable](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)

for testing purposes:

1.  an [open source viewer](https://codebeautify.org/source-code-viewer)
2.  browser dev console network tab

The big challenge with this issue is the way GitHub Pages handles trailing slash urls does not happen in the local development environment, so whatever fix is done must be conditional and only executed when the site is being built and deployed to GitHub Pages.

---

We want Gatsby to turn [name].js files created in the `pages` directory to become /name.html files so that when a browser requests that page without a trailing slash ("/name") from GitHub Pages, it will serve that page.

- [how GitHub Pages handles urls](https://slorber.github.io/trailing-slash-guide/)
- Gatsby and GitHub Pages default interaction for no-trailing-slash is the following: "GitHub pages will redirect from `/xyz` to `/xyz/`" ([source](https://github.com/gatsbyjs/gatsby/discussions/34205#discussioncomment-2007632))

It [has been documented](https://jonsully.net/blog/trailing-slashes-and-gatsby/) that when Gatsby’s [createPage](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createPage) function is given a page.path that ends with “.html” it will create a file with [page.path].html.

Using this knowledge and Gatsby’s onCreatePage API (which gets called automatically each time Gatsby uses createPage on files in the /pages folder), we can insert a step into the workflow to output our desired .html file to replace the page/folder that was just created.

**Building the .html file**

In `gatsby-node.js` file, we add the following code to build the .html pages:
[![onCreatePage](https://i.ibb.co/Z2q8n9N/code1.png)
](https://github.com/randychilau/gatsby-no-trailing-slash-github-pages/blob/main/gatsby-node.js)

code notes:

- `process.env.CI`
  This CI value tells us if the site is being built in GitHub Actions, and lets our method work conditionally and not impact local development environment builds.

- we take the automatically created `page`object as a prop, as well as [`actions`](https://www.gatsbyjs.com/docs/reference/config-files/actions/), which is an object provided by Gatsby.

- all we want to do is build a new page but change two properties. For the `page.path` property, we want to add `.html` to the end of the path with `replacePath`. We also want to ensure the `page.matchPath` is accessed by the client router without the trailing slash (this may already be the case with Gatsby's `trailingSlash: "never"` setting).

> Question: Why do we want to delete the page and folder that was automatically created by Gatsby? Don't we want to keep it so if a browser uses a trailing-slash to request the page from GitHub Pages it will serve the page?
> Answer: Generally you do not want to serve two pages of identical content on two different urls because it can be confusing for SEO. However it is not required to delete the index.html page, and you would still have a Gatsby site that is accessible with no trailing slash.

**Handling trailing slash requests**

Next, we To handle the scenario of a browser requesting a url with a trailing slash, we need to have a folder and index.html file available to prevent a `404` status code, but we want to redirect users to the correct url without the trailing slash. To do this, we use Gatsby's `createRedirect` and a modified version of `gatsby-plugin-meta-redirect` which handles building the folder and index.html file with redirect code (note: `createRedirect` is only active during `production` builds).

So for each page that is recreated with `.html` we want to create a redirect from a trailing slash url to a no-trailing-slash url for the client

![createRedirect](https://i.ibb.co/7zjZGvt/code2.png)

Then we bring in the code from `gatsby-plugin-meta-redirect` for this example, and make the following changes:

- ![ci](https://i.ibb.co/YBrpWDm/code3.png)
  This CI value is used for the following conditional:
  ![enter image description here](https://i.ibb.co/37VMB4T/code4.png)
  So that local development builds are not impacted and redirects are processed properly.
- ![enter image description here](https://i.ibb.co/QjhYWdz/code5.png)
  This line is added so that the resulting index.html file will also include a canonical link to signal what is the proper url.

**Creating the sitemap**

In `gatsby-config.js`, we update the `gatsby-plugin-sitemap` settings to use the `matchPath` (which has the no-trailing-slash path) instead of `path` (which has the .html). This can be seen in the [repo's gatsby-config.js file](https://github.com/randychilau/gatsby-no-trailing-slash-github-pages/blob/main/gatsby-config.js).
code notes:

- ![enter image description here](https://i.ibb.co/7pgQwQC/code6.png)
  Here is where we build the sitemap page. You can see the [repo example](https://randychilau.github.io/gatsby-no-trailing-slash-github-pages/sitemap-0.xml).

**Set trailingSlash to "never"**

![enter image description here](https://i.ibb.co/QNVSR6W/gatsby1.png)

---

**How to check to make sure things are working**

1. We want to check both url scenarios in an open source viewer

- no-trailing-slash
-
- trailing-slash