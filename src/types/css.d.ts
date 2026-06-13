// Ambient declaration so TypeScript accepts CSS side-effect imports
// (e.g. import "../globals.css") without errors under moduleResolution: "bundler"
declare module "*.css" {}
