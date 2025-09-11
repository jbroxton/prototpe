import request from 'supertest';
import { BASE, createTestEpic, detectProjectType, fetchIssue } from './utils/jira-test-helpers';

describe('Story-Epic Linking @jira', () => {
  const projectKey = process.env.JIRA_PROJECT_KEY || 'SPQ';

  it('AC-004: Story linked to Epic (team-managed or company-managed)', async () => {
    const proj = await detectProjectType(projectKey);
    const { key: epicKey } = await createTestEpic(`${Date.now()}`);

    const storyId = `US_${Date.now()}`;
    const story = {
      id: storyId,
      title: `Jira Link Story ${storyId}`,
      description: 'Story description',
      acList: ['AC_001: link'],
      labels: ['alpha'],
      epicKey,
    };
    const syncRes = await request(BASE)
      .post('/api/jira/sync')
      .send({ story, epicKey })
      .set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Story sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const storyKey = syncRes.body.key as string;

    const issueRes = await fetchIssue(storyKey, true);
    if (issueRes.status !== 200) throw new Error(`Issue fetch failed: ${issueRes.status} ${JSON.stringify(issueRes.body)}`);
    const { fields, fieldsRaw } = issueRes.body;

    if (proj.type === 'team-managed') {
      expect(fields.parent?.key).toBe(epicKey);
    } else if (proj.type === 'company-managed') {
      const epicLinkField = proj.epicLinkField;
      expect(epicLinkField).toBeDefined();
      expect(fieldsRaw[epicLinkField!]).toBe(epicKey);
    } else {
      // Unknown project type — fallback: at least one linkage strategy should hold
      const epicLinked = (fields?.parent?.key === epicKey) || Object.values(fieldsRaw || {}).includes(epicKey);
      expect(epicLinked).toBe(true);
    }
  });
});

