const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const region = process.env.AWS_REGION || "us-east-1";

// Load local credentials if any
const clientConfig = {
  region,
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const client = new DynamoDBClient(clientConfig);

async function createTable(tableName, keyName) {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: keyName, KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: keyName, AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  };

  try {
    console.log(`[AWS Table Provisioner] Creating table "${tableName}" with partition key "${keyName}"...`);
    await client.send(new CreateTableCommand(params));
    console.log(`[AWS Table Provisioner] ✓ Success: Table "${tableName}" created successfully in ${region}!`);
  } catch (err) {
    if (err.name === 'ResourceInUseException' || err.message.includes('already exists')) {
      console.log(`[AWS Table Provisioner] Info: Table "${tableName}" already exists. Skipping.`);
    } else {
      console.error(`[AWS Table Provisioner] ✗ Error creating table "${tableName}":`, err.message);
      console.log(`[AWS Table Provisioner] Ensure you have set your AWS credentials in your environment variables before running.`);
    }
  }
}

async function run() {
  console.log("[AWS Table Provisioner] Starting AWS DynamoDB setup...");
  await createTable("zenplan_habits", "id");
  await createTable("zenplan_profiles", "userId");
  console.log("[AWS Table Provisioner] Provisioning sequence complete.");
}

run();
