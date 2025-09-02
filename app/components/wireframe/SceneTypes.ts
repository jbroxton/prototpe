export type Device = 'mobile' | 'tablet' | 'web';

export type Scene = {
  device: Device;
  screens: Screen[];
};

export type Screen = {
  id: string;
  name: string;
  regions: {
    appbar?: { title?: string };
    sidebar?: { items: { id: string; label: string; linkTo?: string }[] };
    content: { blocks: Block[] };
    drawer?: { blocks: Block[] };
  };
};

export type Block =
  | { type: 'Text'; variant: 'title' | 'body'; text?: string }
  | { type: 'Button'; label: string; linkTo?: string; open?: 'drawer' }
  | { type: 'List'; rows: number }
  | { type: 'Card'; title?: string; lines?: number }
  | { type: 'Tabs'; tabs: { id: string; label: string }[]; activeId?: string; panels?: Record<string, Block[]> };
