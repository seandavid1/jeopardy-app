import { PollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } from "@aws-sdk/client-polly";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import awsConfig from '../aws-config';

// Log the AWS configuration (without sensitive data)
console.log('AWS Region:', awsConfig.region);
console.log('AWS Credentials present:', !!awsConfig.credentials.accessKeyId && !!awsConfig.credentials.secretAccessKey);

// Initialize Polly client with error handling
let pollyClient;
try {
  pollyClient = new PollyClient(awsConfig);
  console.log('Polly client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Polly client:', error);
  throw new Error('Failed to initialize AWS Polly client. Please check your AWS configuration.');
}

// List of all available neural voices for Jeopardy
export const VOICES = {
  // US English Neural Voices
  MATTHEW: 'Matthew',     // Male, US English, Neural
  JOANNA: 'Joanna',       // Female, US English, Neural
  IVY: 'Ivy',             // Female, US English, Neural (child voice)
  JUSTIN: 'Justin',       // Male, US English, Neural (child voice)
  KENDRA: 'Kendra',       // Female, US English, Neural
  KIMBERLY: 'Kimberly',   // Female, US English, Neural
  SALLI: 'Salli',         // Female, US English, Neural
  JOEY: 'Joey',           // Male, US English, Neural
  RUTH: 'Ruth',           // Female, US English, Neural
  STEPHEN: 'Stephen',     // Male, US English, Neural
  KEVIN: 'Kevin',         // Male, US English, Neural (child voice)
  
  // British English Neural Voices
  AMY: 'Amy',             // Female, British English, Neural
  EMMA: 'Emma',           // Female, British English, Neural
  BRIAN: 'Brian',         // Male, British English, Neural
  
  // Australian English Neural Voices
  OLIVIA: 'Olivia',       // Female, Australian English, Neural
  
  // Indian English Neural Voices
  ADITI: 'Aditi',         // Female, Indian English, Neural
  RAVEENA: 'Raveena',     // Female, Indian English, Neural
  
  // US Spanish Neural Voices
  LUPE: 'Lupe',           // Female, US Spanish, Neural
  PEDRO: 'Pedro',         // Male, US Spanish, Neural
  
  // Castilian Spanish Neural Voices
  ARLETTE: 'Arlette',     // Female, Castilian Spanish, Neural
  SERGIO: 'Sergio',       // Male, Castilian Spanish, Neural
  
  // French Neural Voices
  LEA: 'Lea',             // Female, French, Neural
  REMI: 'Remi',           // Male, French, Neural
  
  // Canadian French Neural Voices
  GABRIELLE: 'Gabrielle', // Female, Canadian French, Neural
  LUCIA: 'Lucia',         // Female, Canadian French, Neural
  
  // German Neural Voices
  VICKI: 'Vicki',         // Female, German, Neural
  DANIEL: 'Daniel',       // Male, German, Neural
  
  // Italian Neural Voices
  BIANCA: 'Bianca',       // Female, Italian, Neural
  ADRIANO: 'Adriano',     // Male, Italian, Neural
  
  // Japanese Neural Voices
  TAKUMI: 'Takumi',       // Male, Japanese, Neural
  MIZUKI: 'Mizuki',       // Female, Japanese, Neural
  
  // Korean Neural Voices
  SEOYEON: 'Seoyeon',     // Female, Korean, Neural
  
  // Brazilian Portuguese Neural Voices
  CAMILA: 'Camila',       // Female, Brazilian Portuguese, Neural
  VITORIA: 'Vitoria',     // Female, Brazilian Portuguese, Neural
  THIAGO: 'Thiago',       // Male, Brazilian Portuguese, Neural
  
  // European Portuguese Neural Voices
  INES: 'Ines',           // Female, European Portuguese, Neural
  
  // Chinese Neural Voices
  ZHIYU: 'Zhiyu',         // Female, Chinese, Neural
};

// Default voice - you can change this to any from the VOICES object
export const DEFAULT_VOICE = VOICES.STEPHEN;

// Cache for voices list
let voicesCache = null;

// Test function to verify AWS credentials and Polly access
export const testPollyConnection = async () => {
  try {
    console.log('Attempting to connect to AWS Polly...');
    
    const command = new DescribeVoicesCommand({
      LanguageCode: 'en-US'
    });
    
    const response = await pollyClient.send(command);
    console.log('AWS Polly connection successful!');
    console.log('Available voices:', response.Voices.map(voice => voice.Name));
    return true;
  } catch (error) {
    console.error('AWS Polly connection failed. Error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.$metadata?.httpStatusCode);
    console.error('Full error:', error);
    return false;
  }
};

export const listAvailableVoices = async () => {
  // Return cached voices if available
  if (voicesCache) {
    console.log('Returning cached voices list');
    return voicesCache;
  }

  try {
    console.log('Fetching voices list from AWS Polly...');
    const command = new DescribeVoicesCommand({
      LanguageCode: 'en-US',
      Engine: 'neural'
    });
    
    const response = await pollyClient.send(command);
    console.log('Available Neural Voices:');
    response.Voices.forEach(voice => {
      console.log(`- ${voice.Name} (${voice.Gender})`);
    });
    
    // Cache the voices list
    voicesCache = response.Voices;
    return voicesCache;
  } catch (error) {
    console.error('Error listing voices:', error);
    throw error;
  }
};

export const synthesizeSpeech = async (text, voiceId = DEFAULT_VOICE) => {
  if (!pollyClient) {
    throw new Error('Polly client not initialized');
  }

  try {
    const command = new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      Text: text,
      VoiceId: voiceId,
      Engine: "neural", // Use neural engine for better quality
      TextType: "text",
      SampleRate: "24000", // Higher quality
      LanguageCode: "en-US"
    });

    console.log('Generating speech...');
    const response = await pollyClient.send(command);
    console.log('Speech generated successfully');
    
    // Convert the audio stream to a blob URL
    const audioBlob = new Blob([await response.AudioStream.transformToByteArray()], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error("Error in synthesizeSpeech:", error);
    throw error;
  }
}; 