#!/usr/bin/env node

// Test Jira API connection
const https = require('https');

const JIRA_URL = 'justinmbroxton.atlassian.net';
const JIRA_EMAIL = 'justinmbroxton@gmail.com';
const JIRA_API_TOKEN = 'ATCTT3xFfGN0OAU_N9_zKWUt7EEtA6RiBFMTnvJtkmiaGmAzwO4odEFmEUbXi_OigJj6sx_o7WIZnnCBcUjIKCPGPRqabNAnq_GmPvGEI8kRMGvnj813asK49zqKQ_fPci9QWrJzDumX9vXKknNFYnB-V3r_MBzk-FzNs_wWDHE4R5eQOOxZLPk=F5A7C2B6';

// Create basic auth header
const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

console.log('Testing Jira API connection...');
console.log(`URL: https://${JIRA_URL}`);
console.log(`Email: ${JIRA_EMAIL}`);
console.log(`Token length: ${JIRA_API_TOKEN.length} chars`);
console.log('');

// Test 1: Get current user
const options = {
  hostname: JIRA_URL,
  path: '/rest/api/3/myself',
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('\n✅ Connection successful!');
        console.log(`User: ${json.displayName} (${json.emailAddress})`);
        console.log(`Account ID: ${json.accountId}`);
        
        // Test 2: Get project
        testProject();
      } else {
        console.log('\n❌ Connection failed:');
        console.log(JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.log('\n❌ Error parsing response:');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Request error: ${e.message}`);
});

req.end();

function testProject() {
  console.log('\nTesting project access...');
  
  const projectOptions = {
    hostname: JIRA_URL,
    path: '/rest/api/3/project/CM3',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  };
  
  const projectReq = https.request(projectOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log(`✅ Project found: ${json.name} (${json.key})`);
          console.log(`Project ID: ${json.id}`);
          console.log(`Project Type: ${json.projectTypeKey}`);
        } else {
          console.log('❌ Project not found or no access');
          console.log(JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log('❌ Error:', data);
      }
    });
  });
  
  projectReq.on('error', (e) => {
    console.error(`❌ Project request error: ${e.message}`);
  });
  
  projectReq.end();
}