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
    },
    // Copy the Vite-built React frontend into the app bundle.
    // The preBuild script ensures it is compiled first.
    copy: {
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
