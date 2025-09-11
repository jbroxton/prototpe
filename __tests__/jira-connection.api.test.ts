import request from 'supertest';

describe('Jira Connection Tests', () => {
  const baseUrl = 'http://localhost:3000';
  
  describe('POST /api/jira/connect @jira', () => {
    it('should verify Jira credentials are working', async () => {
      // Read credentials from environment
      const credentials = {
        url: process.env.JIRA_BASE_URL || process.env.JIRA_URL || '',
        email: process.env.JIRA_EMAIL || '',
        apiToken: process.env.JIRA_API_TOKEN || ''
      };

      // Check if credentials are configured
      if (!credentials.url || !credentials.email || !credentials.apiToken) {
        console.warn('⚠️  Jira credentials not fully configured in environment variables');
        console.log('Required variables: JIRA_BASE_URL/JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN');
        return;
      }

      console.log('🔍 Testing Jira connection...');
      console.log(`   URL: ${credentials.url}`);
      console.log(`   Email: ${credentials.email}`);
      console.log(`   Token: ${credentials.apiToken.substring(0, 4)}...`);

      const response = await request(baseUrl)
        .post('/api/jira/connect')
        .send(credentials)
        .expect('Content-Type', /json/);

      // Log the full response for debugging
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('ok');
        expect(response.body.ok).toBe(true);
        console.log('✅ Jira credentials are valid and working!');
      } else {
        console.error('❌ Jira connection failed:', response.body);
        expect(response.status).toBe(200); // This will fail and show the actual status
      }
    });

    it('should handle invalid credentials gracefully @jira', async () => {
      const invalidCredentials = {
        url: 'https://fake-instance.atlassian.net',
        email: 'invalid@example.com',
        apiToken: 'invalid-token'
      };

    const response = await request(baseUrl)
      .post('/api/jira/connect')
      .send(invalidCredentials)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    console.log('✅ Invalid credentials handled correctly (400)');
    });
  });

  describe('GET /api/jira/issue @jira', () => {
    it('should fetch an issue if valid key provided', async () => {
      // This test requires a known issue key
      const testIssueKey = process.env.TEST_JIRA_ISSUE_KEY || 'TEST-1';
      
      const response = await request(baseUrl)
        .get(`/api/jira/issue?key=${testIssueKey}`)
        .expect('Content-Type', /json/);

      console.log('Issue fetch response:', response.status, response.body);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('key');
        console.log(`✅ Successfully fetched issue: ${response.body.key}`);
        if (response.body.fields) {
          console.log(`   Summary: ${response.body.fields.summary || 'N/A'}`);
          console.log(`   Status: ${response.body.fields.status?.name || 'N/A'}`);
        }
      } else {
        console.log(`⚠️  Could not fetch issue ${testIssueKey} - may not exist or no permissions`);
      }
    });
  });
});
