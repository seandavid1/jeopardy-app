// AWS Configuration
const awsConfig = {
  region: 'us-east-1', // Change this to your preferred region
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  }
};

// Validate AWS configuration
if (!awsConfig.credentials.accessKeyId || !awsConfig.credentials.secretAccessKey) {
  console.error('AWS credentials are not properly configured. Please check your .env file.');
  throw new Error('AWS credentials are missing. Please ensure REACT_APP_AWS_ACCESS_KEY_ID and REACT_APP_AWS_SECRET_ACCESS_KEY are set in your .env file.');
}

console.log('AWS Configuration loaded:', {
  region: awsConfig.region,
  hasAccessKey: !!awsConfig.credentials.accessKeyId,
  hasSecretKey: !!awsConfig.credentials.secretAccessKey
});

export default awsConfig; 