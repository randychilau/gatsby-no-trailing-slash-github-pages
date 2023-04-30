## Example of Gatsby Site hosted on GitHub Pages without a trailing slash (aka "no-trailing-slash") in the url (including the sitemap)

Here is the [example site](https://randychilau.github.io/gatsby-no-trailing-slash-github-pages/). Thanks for visiting!

---

Credit:
[slorber](https://github.com/slorber), [jon-sully](https://github.com/jon-sully), [gatsby-plugin-meta-redirect](https://github.com/nsresulta/gatsby-plugin-meta-redirect), Gatsby Team, everyone on "the threads" [[1]](https://github.com/gatsbyjs/gatsby/discussions/34205)[[2]](https://github.com/gatsbyjs/gatsby/discussions/27889), and ChatGPT for pointing me in a direction I wasn't considering.

---

**tl;dr**

- use `onCreatePage` to make html files for no-trailing-slash requests
- use `createRedirect` to handle trailing slash requests
- set `trailingSlash` to `"never"`

---

Notes:

- This issue may not be relevant anymore as some may have moved on from hosting on GitHub Pages or changed their stance on trailing-slash vs no-trailing-slash. For those interested in a working example, hopefully this is helpful.
- It was a simple request (remove the trailing slash) that became a trip down the rabbit hole. And when you resurface days, weeks later, you write a post like this to put a sign next to that rabbit hole that says "feel free to read before going down".
- There may be some aspects of this example that are not "best practice" or misunderstanding certain functions or syntax. Please feel free to provide feedback by creating an issue? to help improve the method, as well as increase the readability of this page.

---

This method will mention the following items and are linked to their respective documentation for your reference:

from Gatsby:

1. [`page.path`](https://www.gatsbyjs.com/docs/gatsby-internals-terminology/#path) and [`page.matchPath`](https://www.gatsbyjs.com/docs/gatsby-internals-terminology/#matchpath) properties
2. [`onCreatePage` API](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onCreatePage)
3. [`createRedirect`](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createRedirect)
4. a modified version of [`gatsby-plugin-meta-redirect`](https://www.gatsbyjs.com/plugins/gatsby-plugin-meta-redirect/)
5. update settings for [`gatsby-plugin-sitemap`](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/)
6. [`trailingSlash`](https://www.gatsbyjs.com/docs/reference/release-notes/v4.7/#trailingslash-option)

from GitHub:

1.  [CI environment variable](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)

for testing purposes:

1.  an [open source viewer](https://codebeautify.org/source-code-viewer)
2.  browser dev console network tab

---

## What do we want to do?

We want Gatsby to turn `[name].js` files created in the `pages` directory to become `name.html` files. We want this because when GitHub Pages receives a browser request with no-trailing-slash, for example`/name`, it will attempt to serve `name.html`file.

Currently [Gatsby turns](https://jonsully.net/blog/trailing-slashes-and-gatsby/) [`name].js`files in the`pages`directory into a`/[name]`folder with an`index.html` file.

The default behavior of how GitHub Pages handles a Gatsby site url with no-trailing-slash can be seen in the example below using a source code viewer:

![enter image description here](https://i.ibb.co/J2vcCfH/code17.png)

since it cannot find the `[name].html` file (in the above example, blog.html), it sees the folder named `blog` and GitHub Pages creates a 301 redirect to that folder (now the url has a trailing slash), and loads the `index.html` file. Checking the browser console network tab shows the same:

![enter image description here](https://i.ibb.co/NjFgQRv/code18.png)

It [has been documented](https://jonsully.net/blog/trailing-slashes-and-gatsby/) that when Gatsby’s [createPage](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createPage) function is given a page.path that ends with “.html” it will create a file with [page.path].html.

Using this knowledge and Gatsby’s `onCreatePage API` (which gets called automatically each time Gatsby uses `createPage` on files in the `/pages` folder), we can insert a step into the workflow to output our desired .html file to replace the page/folder that was just created.

additional reading:

- [how GitHub Pages handles urls](https://slorber.github.io/trailing-slash-guide/)
- Gatsby and GitHub Pages default interaction for no-trailing-slash is the following: "GitHub pages will redirect from `/xyz` to `/xyz/`" ([source](https://github.com/gatsbyjs/gatsby/discussions/34205#discussioncomment-2007632))
- sidenote: there [used to be a plugin](https://npm.io/package/gatsby-plugin-create-page-html) that helped created .html files, but it was deleted.

---

**Building the .html file**

In `gatsby-node.js` file, we add the following code to build the .html pages:
[![onCreatePage](https://i.ibb.co/Z2q8n9N/code1.png)
](https://github.com/randychilau/gatsby-no-trailing-slash-github-pages/blob/main/gatsby-node.js)

code notes:

- `process.env.CI`
  This CI value tells us if the site is being built in GitHub Actions, and lets our method work conditionally and not impact local development environment builds. If you do not use GitHub Actions to update your site on GitHub Pages and use a script like [`"deploy":  "gatsby build --prefix-paths && gh-pages -d public"`](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/how-gatsby-works-with-github-pages/), then you will want to include the CI variable in your command: `CI=true npm run deploy`.

- we take the automatically created `page`object as a prop for the `onCreatePage` function, as well as [`actions`](https://www.gatsbyjs.com/docs/reference/config-files/actions/), which is an object provided by Gatsby.

- we want to build a new page that changes the `page.path` and add a page.matchPath property.
  - For the `page.path` property, we change it to end in `.html` with `replacePath`, so `createPage` will output the html file. (e.g. `/blog` will output `blog.html`)
  - We add a `page.matchPath` property set to the original `page.path` (with no-trailing-slash) for the client router to find.

> **Question**: Why do we want to delete the page and folder that was automatically created by Gatsby? Don't we want to keep it so if a browser uses a trailing-slash to request the page from GitHub Pages it will serve the page?
> **Answer**: Generally you do not want to serve two pages of identical content on two different urls because it can be confusing for SEO. However it is not required to delete the index.html page, and you would still have a Gatsby site that is accessible with no trailing slash.

---

**Handling trailing slash requests**

Next, we handle a browser requesting a url with a trailing slash, we need to have a folder and index.html file available to prevent a `404` status code, but we want to redirect users to the correct url with no-trailing-slash.

To do this, we use Gatsby's `createRedirect` and a modified version of `gatsby-plugin-meta-redirect` which handles building the folder and index.html file with redirect code (note: `createRedirect` is only active during `production` builds).

So for each page that is recreated with `.html` we want to create a redirect from a trailing slash url to a no-trailing-slash url within the browser.

![createRedirect](https://i.ibb.co/7zjZGvt/code2.png)

Then we bring in the code from `gatsby-plugin-meta-redirect` for this example, and make the following changes:

- ![ci](https://i.ibb.co/YBrpWDm/code3.png)
  This CI value is used for the following conditional:
  ![enter image description here](https://i.ibb.co/37VMB4T/code4.png)
  So that local development is not impacted and redirects are processed properly.
- ![enter image description here](https://i.ibb.co/QjhYWdz/code5.png)
  This line is added so that the resulting index.html file will also include a canonical link to signal what is the proper url.

---

**Creating the sitemap**

In `gatsby-config.js`, we update the `gatsby-plugin-sitemap` settings to use the `matchPath` (which has the no-trailing-slash path) instead of `path` (which has the .html). This can be seen in the [repo's gatsby-config.js file](https://github.com/randychilau/gatsby-no-trailing-slash-github-pages/blob/main/gatsby-config.js).

code notes:

- ![enter image description here](https://i.ibb.co/7pgQwQC/code6.png)
  Here is where we build the sitemap page. You can see the [repo example](https://randychilau.github.io/gatsby-no-trailing-slash-github-pages/sitemap-0.xml).

---

**Set trailingSlash to "never"**

![enter image description here](https://i.ibb.co/QNVSR6W/gatsby1.png)

---

**How to check to make sure things are working**

> **reminder**: The way GitHub Pages handles trailing slash urls does not
> happen when you are in local `development` and `production`
> environments, so the fix should be conditional and executed when the
> site is being built and deployed within GitHub Actions or with
> `CI=true` before npm scripts.

1. After GitHub Actions or your deploy script has the build in GitHub Pages, go to a site page with no-trailing slash in your browser and click "Refresh" to reload the url. You should not see any change in the address bar or a trailing slash appear/disappear. If you access the browser console's `network` tab and see a status 200 code to load the page, then it is working.
   ![enter image description here](https://i.ibb.co/BT0H4nF/code9.png)

2. Add a trailing slash to the url and hit "Enter", you should see the trailing slash disappear and the page load. In the browser console's "network" tab, you should see two 200 status codes, one for the trailing slash page with the redirect and another one for the no-trailing-slash page which loads the content.
   ![enter image description here](https://i.ibb.co/JCNNFYk/code11.png)

**Another way to check is to use a source code viewer.**

- Enter a url with no-trailing-slash from your site (e.g. https://randychilau.github.io/gatsby-no-trailing-slash-github-pages/page1) into the source code viewer, you should see the page code.
  ![enter image description here](https://i.ibb.co/t8kLKbD/code7.png)

- Add a trailing-slash to the url and get the source code, you should see:
  ![enter image description here](https://i.ibb.co/2PPXmcZ/code8.png)
  a meta refresh tag that will redirect the browser to the no-trailing-slash url of the page. You should also see the canonical tag.

**Another indicator Gatsby is building pages correctly**
When you run a build in GitHub Actions, in the build logs you should see pages being created ending with `.html`.
![enter image description here](https://i.ibb.co/fDj9D5g/code14.png)
(you can also see this in your IDE console if enter `CI=true npm run build`)

---

**Additional notes:**

- If you are dynamically building pages using other Gatsby functions such as [createPages](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createPages), create a conditional createPage function that will change modes based on the CI env variable. Here is an example:

![enter image description here](https://i.ibb.co/x64JtBv/code12.png)

- If you are using pathPrefix with your site, be sure to check that the urls for the redirect and canonical tag are being built correctly, you may need to edit the `getMetaRedirect` function

---

So here is [the working example](https://randychilau.github.io/gatsby-no-trailing-slash-github-pages/) of a Gatsby site hosted on GitHub Pages that doesn't use trailing slashes.

Feel free to let me know if anything needs additional explanation.

Thanks for reading and cheers to everyone posting those signs next to rabbit holes.
