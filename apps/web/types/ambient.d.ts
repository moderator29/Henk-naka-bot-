// Side-effect imports that ship no type declarations of their own. Without
// these, TypeScript 5.7+ reports TS2882 for `import "..."` style imports.
declare module "*.css";
declare module "server-only";
declare module "client-only";
