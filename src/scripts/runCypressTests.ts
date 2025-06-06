require('dotenv').config();

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { SlackNotifier } from '../services/slackNotifier';

const execAsync = promisify(exec);

async function runTests() {
  let stdout = '';
  try {
    console.log('Starting Cypress tests...');
    const result = await execAsync('npx cypress run --spec "cypress/e2e/automation-practice.cy.ts"');
    stdout = result.stdout;
    console.log('Cypress output:', stdout);
  } catch (error: any) {
    // Cypress returns exit code 1 when tests fail, but we still want to process the results
    if (error.stdout) {
      stdout = error.stdout;
      console.log('Cypress output (from error):', stdout);
    } else {
      console.error('Error running tests:', error);
      throw error;
    }
  }

  // Parse test results from the summary section
  const resultsSectionMatch = stdout.match(/\(Results\)([\s\S]*)\(Run Finished\)/);
  let results = {
    passedTests: 0,
    failedTests: 0,
    duration: 0
  };

  if (resultsSectionMatch && resultsSectionMatch[1]) {
    const summary = resultsSectionMatch[1];
    const passingMatch = summary.match(/Passing:\s+(\d+)/);
    const failingMatch = summary.match(/Failing:\s+(\d+)/);
    const durationMatch = summary.match(/Duration:\s+(\d+)\s*seconds/);

    results = {
      passedTests: passingMatch ? parseInt(passingMatch[1], 10) : 0,
      failedTests: failingMatch ? parseInt(failingMatch[1], 10) : 0,
      duration: durationMatch ? parseInt(durationMatch[1], 10) * 1000 : 0
    };
  }

  console.log('Test results:', results);

  // Send results to Slack
  const slackNotifier = new SlackNotifier();
  await slackNotifier.sendTestResults(results);

  // If there are failures, send screenshots
  if (results.failedTests > 0) {
    console.log(`Found ${results.failedTests} failed tests. Checking for screenshots.`);
    const screenshotsDir = path.join(process.cwd(), 'cypress', 'screenshots');
    
    if (fs.existsSync(screenshotsDir)) {
      console.log('Screenshots directory exists.');
      const items = fs.readdirSync(screenshotsDir);
      console.log(`Found ${items.length} items in screenshots directory.`);

      for (const item of items) {
        const itemPath = path.join(screenshotsDir, item);
        console.log('Checking item in screenshots directory:', itemPath);

        if (fs.statSync(itemPath).isDirectory()) {
          console.log('Item is a directory (spec file folder).');
          const specScreenshots = fs.readdirSync(itemPath);
          console.log(`Found ${specScreenshots.length} items in spec folder: ${itemPath}`);

          for (const screenshot of specScreenshots) {
            const fullScreenshotPath = path.join(itemPath, screenshot);
            console.log('Checking item in spec folder:', fullScreenshotPath);
            
            if (screenshot.endsWith('.png') && fs.statSync(fullScreenshotPath).isFile()) {
              console.log('Found a PNG screenshot file:', fullScreenshotPath);
              await slackNotifier.sendScreenshot(fullScreenshotPath);
              console.log('Screenshot sent (attempted).');
            }
          }
        }
      }
    } else {
      console.log('Screenshots directory does NOT exist at:', screenshotsDir);
    }
  }

  return results;
}

runTests().catch(console.error);