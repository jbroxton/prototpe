import { Scene, Screen, Device, Block } from "./SceneTypes";

export type Op =
  | { op: 'setDevice'; device: Device }
  | { op: 'addScreen'; id: string; name: string; layout?: 'appbar-only'|'appbar+sidebar'; appbarTitle?: string }
  | { op: 'ensureSidebar'; screenId: string; items: { id: string; label: string; linkTo?: string }[] }
  | { op: 'addBlock'; screenId: string; region: 'content'|'drawer'; block: Block }
  | { op: 'setDrawer'; screenId: string; blocks: Block[] };

export function createEmptyScene(device: Device = 'mobile'): Scene {
  return { device, screens: [] };
}

export function applyOps(scene: Scene | undefined, ops: Op[]): Scene {
  let s: Scene = scene ? structuredClone(scene) : createEmptyScene();
  for (const op of ops) {
    switch (op.op) {
      case 'setDevice':
        s.device = op.device; break;
      case 'addScreen': {
        if (s.screens.find(sc => sc.id === op.id)) break;
        const screen: Screen = {
          id: op.id,
          name: op.name,
          regions: {
            appbar: { title: op.appbarTitle || op.name },
            ...(op.layout === 'appbar+sidebar' ? { sidebar: { items: [] } } : {}),
            content: { blocks: [] },
          },
        };
        s.screens.push(screen);
        break;
      }
      case 'ensureSidebar': {
        const sc = s.screens.find(x => x.id === op.screenId); if (!sc) break;
        if (!sc.regions.sidebar) sc.regions.sidebar = { items: [] };
        sc.regions.sidebar.items = op.items;
        break;
      }
      case 'addBlock': {
        const sc = s.screens.find(x => x.id === op.screenId); if (!sc) break;
        if (op.region === 'content') sc.regions.content.blocks.push(op.block);
        else {
          if (!sc.regions.drawer) sc.regions.drawer = { blocks: [] };
          sc.regions.drawer.blocks.push(op.block);
        }
        break;
      }
      case 'setDrawer': {
        const sc = s.screens.find(x => x.id === op.screenId); if (!sc) break;
        sc.regions.drawer = { blocks: op.blocks };
        break;
      }
    }
  }
  return s;
}

