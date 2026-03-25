import type { ElectrobunConfig } from 'electrobun';

const config: ElectrobunConfig = {
  app: {
    name: 'Invoice Generator',
    identifier: 'com.invoice.generator',
    version: '1.0.0',
    description: 'A modern, fully offline invoice generator',
  },
  build: {
    bun: {
      entrypoint: 'src/bun/index.ts',
      // Keep the libsql native addon external so bun build doesn't try to
      // inline it.  It is copied to node_modules/ in Resources (see below)
      // so that Bun can resolve it at runtime.
      external: ['libsql'],
    },
    copy: {
      // libsql native addon — provides SQLite access for @libsql/client.
      // With the Prisma driver adapter this replaces the heavy Prisma query
      // engine binary, so only this one small native file is needed.
      '../../node_modules/libsql': 'node_modules/libsql',
      // Vite-built React SPA.  The preBuild script compiles it first.
      '../web/dist': 'web',
    },
    win: {
      icon: 'assets/icon.ico',
    },
    scripts: {
      preBuild: 'npm run build --workspace=@invoice/web',
    },
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
};

export default config;
