/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the site can drop into the existing maydan.om host as
  // plain files (out/). Trailing slashes make /privacy/ /terms/ /support/
  // resolve as folders — matching the URLs the iOS app already links to.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
