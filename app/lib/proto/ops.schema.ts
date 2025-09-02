// JSON Schema for our prototype Ops[] contract used by the LLM
// This mirrors app/components/wireframe/ops.ts types to minimize glue code.

export const OpsSchema = {
  type: 'array',
  maxItems: 25,
  items: {
    oneOf: [
      {
        type: 'object',
        properties: {
          op: { const: 'setDevice' },
          device: { enum: ['mobile', 'tablet', 'web'] },
        },
        required: ['op', 'device'],
        additionalProperties: false,
      },
      {
        type: 'object',
        properties: {
          op: { const: 'addScreen' },
          id: { type: 'string' },
          name: { type: 'string' },
          layout: { enum: ['appbar-only', 'appbar+sidebar'] },
          appbarTitle: { type: 'string' },
        },
        required: ['op', 'id', 'name'],
        additionalProperties: false,
      },
      {
        type: 'object',
        properties: {
          op: { const: 'ensureSidebar' },
          screenId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                linkTo: { type: 'string' },
              },
              required: ['id', 'label'],
              additionalProperties: false,
            },
            maxItems: 20,
          },
        },
        required: ['op', 'screenId', 'items'],
        additionalProperties: false,
      },
      {
        type: 'object',
        properties: {
          op: { const: 'addBlock' },
          screenId: { type: 'string' },
          region: { enum: ['content', 'drawer'] },
          block: {
            // A lightweight block description used by our wireframe renderer
            type: 'object',
            properties: {
              type: {
                enum: ['Text', 'Button', 'Input', 'List', 'Card', 'NavBar', 'Tabs'],
              },
              // Generic optional props used by blocks
              text: { type: 'string' },
              label: { type: 'string' },
              title: { type: 'string' },
              lines: { type: 'number' },
              rows: { type: 'number' },
              variant: { type: 'string' },
              linkTo: { type: 'string' },
              open: { enum: ['drawer', 'modal'] },
              tabs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { id: { type: 'string' }, label: { type: 'string' } },
                  required: ['id', 'label'],
                  additionalProperties: false,
                },
                maxItems: 6,
              },
              activeId: { type: 'string' },
              panels: { type: 'object' },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
        required: ['op', 'screenId', 'region', 'block'],
        additionalProperties: false,
      },
      {
        type: 'object',
        properties: {
          op: { const: 'setDrawer' },
          screenId: { type: 'string' },
          blocks: { type: 'array', items: { type: 'object' }, maxItems: 20 },
        },
        required: ['op', 'screenId', 'blocks'],
        additionalProperties: false,
      },
    ],
  },
} as const;

export type OpsJson = unknown[];

