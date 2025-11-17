import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agency from '../models/Agency';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/balkan-estate';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

const logTest = (testName: string, passed: boolean, error?: string, data?: any) => {
  results.push({ testName, passed, error, data });

  if (passed) {
    console.log(`${colors.green}✓ ${testName}${colors.reset}`);
    if (data) {
      console.log(`${colors.gray}  → ${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ ${testName}${colors.reset}`);
    if (error) {
      console.log(`${colors.red}  → Error: ${error}${colors.reset}`);
    }
  }
};

const testAgencyAccess = async () => {
  try {
    console.log(`${colors.cyan}\n========================================`);
    console.log(`${colors.cyan}Agency Access Test Suite`);
    console.log(`${colors.cyan}========================================\n${colors.reset}`);

    // Connect to MongoDB
    console.log(`${colors.yellow}Connecting to MongoDB...${colors.reset}`);
    await mongoose.connect(MONGODB_URI);
    console.log(`${colors.green}✓ Connected to MongoDB\n${colors.reset}`);

    // ===== TEST 1: Get all agencies from database =====
    console.log(`${colors.yellow}\n--- Test 1: Fetch All Agencies ---${colors.reset}`);
    const allAgencies = await Agency.find({});
    logTest(
      'Fetch all agencies',
      true,
      undefined,
      { count: allAgencies.length, agencies: allAgencies.map(a => ({ id: a._id, name: a.name, slug: a.slug })) }
    );

    if (allAgencies.length === 0) {
      console.log(`${colors.yellow}\n⚠️  No agencies found in database. Skipping detailed tests.${colors.reset}`);
      return;
    }

    // ===== TEST 2: Test each agency by ID =====
    console.log(`${colors.yellow}\n--- Test 2: Access by MongoDB ID ---${colors.reset}`);
    for (const agency of allAgencies) {
      try {
        const fetchedById = await Agency.findById(agency._id);
        logTest(
          `Access agency by ID: ${agency._id}`,
          !!fetchedById,
          undefined,
          { name: fetchedById?.name, slug: fetchedById?.slug }
        );
      } catch (error: any) {
        logTest(`Access agency by ID: ${agency._id}`, false, error.message);
      }
    }

    // ===== TEST 3: Test each agency by slug =====
    console.log(`${colors.yellow}\n--- Test 3: Access by Slug ---${colors.reset}`);
    for (const agency of allAgencies) {
      try {
        const fetchedBySlug = await Agency.findOne({ slug: agency.slug.toLowerCase() });
        logTest(
          `Access agency by slug: ${agency.slug}`,
          !!fetchedBySlug,
          undefined,
          { id: fetchedBySlug?._id, name: fetchedBySlug?.name }
        );
      } catch (error: any) {
        logTest(`Access agency by slug: ${agency.slug}`, false, error.message);
      }
    }

    // ===== TEST 4: Test slug with country prefix (old format) =====
    console.log(`${colors.yellow}\n--- Test 4: Access by Slug with Country Prefix ---${colors.reset}`);
    for (const agency of allAgencies) {
      try {
        // Simulate old format: "country,slug"
        const slugWithCountry = `${agency.country?.toLowerCase() || 'unknown'},${agency.slug}`;
        const normalizedSlug = slugWithCountry.split(',')[1]; // Remove country prefix

        const fetchedByNormalizedSlug = await Agency.findOne({ slug: normalizedSlug.toLowerCase() });
        logTest(
          `Access agency by normalized slug: ${slugWithCountry} → ${normalizedSlug}`,
          !!fetchedByNormalizedSlug,
          undefined,
          { id: fetchedByNormalizedSlug?._id, name: fetchedByNormalizedSlug?.name }
        );
      } catch (error: any) {
        logTest(`Access agency with country prefix`, false, error.message);
      }
    }

    // ===== TEST 5: Test invalid access methods =====
    console.log(`${colors.yellow}\n--- Test 5: Invalid Access (Expected Failures) ---${colors.reset}`);

    // Test with invalid ID
    try {
      const invalidId = '000000000000000000000000';
      const result = await Agency.findById(invalidId);
      logTest(
        `Access with invalid ID: ${invalidId}`,
        result === null,
        undefined,
        { found: false }
      );
    } catch (error: any) {
      logTest('Access with invalid ID', false, error.message);
    }

    // Test with invalid slug
    try {
      const invalidSlug = 'non-existent-agency-slug-12345';
      const result = await Agency.findOne({ slug: invalidSlug });
      logTest(
        `Access with invalid slug: ${invalidSlug}`,
        result === null,
        undefined,
        { found: false }
      );
    } catch (error: any) {
      logTest('Access with invalid slug', false, error.message);
    }

    // ===== TEST 6: Test case sensitivity =====
    console.log(`${colors.yellow}\n--- Test 6: Case Sensitivity ---${colors.reset}`);
    if (allAgencies.length > 0) {
      const testAgency = allAgencies[0];
      const variations = [
        testAgency.slug.toLowerCase(),
        testAgency.slug.toUpperCase(),
        testAgency.slug.charAt(0).toUpperCase() + testAgency.slug.slice(1),
      ];

      for (const variation of variations) {
        try {
          const result = await Agency.findOne({ slug: variation.toLowerCase() });
          logTest(
            `Access with slug variation: ${variation}`,
            !!result,
            undefined,
            { normalized: variation.toLowerCase(), found: !!result }
          );
        } catch (error: any) {
          logTest(`Access with slug variation: ${variation}`, false, error.message);
        }
      }
    }

    // ===== SUMMARY =====
    console.log(`${colors.cyan}\n========================================`);
    console.log(`${colors.cyan}Test Summary`);
    console.log(`${colors.cyan}========================================${colors.reset}`);

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log(`${colors.green}\nPassed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`Total: ${results.length}`);

    if (failed > 0) {
      console.log(`${colors.red}\n❌ Some tests failed. Check the errors above.${colors.reset}`);
    } else {
      console.log(`${colors.green}\n✅ All tests passed!${colors.reset}`);
    }

    // ===== METADATA REPORT =====
    console.log(`${colors.cyan}\n========================================`);
    console.log(`${colors.cyan}Agency Metadata Report`);
    console.log(`${colors.cyan}========================================\n${colors.reset}`);

    for (const agency of allAgencies) {
      console.log(`${colors.yellow}\nAgency: ${agency.name}${colors.reset}`);
      console.log(`  ID: ${agency._id}`);
      console.log(`  Slug: ${agency.slug}`);
      console.log(`  Country: ${agency.country || 'N/A'}`);
      console.log(`  City: ${agency.city || 'N/A'}`);
      console.log(`  Email: ${agency.email}`);
      console.log(`  Phone: ${agency.phone}`);
      console.log(`  Featured: ${agency.isFeatured ? 'Yes' : 'No'}`);
      console.log(`  Total Agents: ${agency.totalAgents}`);
      console.log(`  Total Properties: ${agency.totalProperties}`);

      // Test URL patterns that should work
      console.log(`${colors.gray}  \n  URL Access Methods:${colors.reset}`);
      console.log(`${colors.gray}    - By ID: /api/agencies/${agency._id}${colors.reset}`);
      console.log(`${colors.gray}    - By slug: /api/agencies/${agency.slug}${colors.reset}`);
      if (agency.country) {
        console.log(`${colors.gray}    - Legacy format: /api/agencies/${agency.country.toLowerCase()},${agency.slug}${colors.reset}`);
      }
    }

  } catch (error: any) {
    console.error(`${colors.red}\n❌ Test suite error:${colors.reset}`, error);
  } finally {
    await mongoose.connection.close();
    console.log(`${colors.yellow}\n\nDisconnected from MongoDB${colors.reset}`);
  }
};

// Run the tests
testAgencyAccess().catch(console.error);
