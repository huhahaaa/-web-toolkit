# Web Toolkit

Vite + React single-page toolkit app.

## Project Map

- `src/main.jsx`: React entry point and router bootstrap.
- `src/App.jsx`: top-level routes and providers.
- `src/components/`: shared layout, navigation, cards, and controls.
- `src/context/`: auth, gallery, and schedule state providers plus hooks.
- `src/hooks/`: reusable timer, local storage, and animation-loop hooks.
- `src/pages/`: feature pages for home, timer, schedule, gallery, sorting, pathfinding, and team.
- `src/utils/`: sorting and pathfinding algorithm generators.
- `public/`: static favicon and icon sprite.

## Local Run

Dependencies are already installed in `node_modules`. If they are missing later, run:

```sh
npm.cmd install
```

Start the dev server from PowerShell:

```sh
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Then open:

```txt
http://127.0.0.1:5173/
```

You can also run the Windows helper script:

```sh
.\start-local.cmd
```

PowerShell note: use `npm.cmd` instead of `npm` if your machine blocks `npm.ps1` with an execution policy error.

## Checks

```sh
npm.cmd run lint
npm.cmd run build
```
