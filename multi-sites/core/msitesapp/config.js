import 'dotenv/config';

const config = {
    // api
    api: {
        baseUrl: process.env.API_BASE_URL,
        openAiKey: process.env.OPENAI_API_KEY
    },

    // Circuit Breaker Configuration
    circuitBreaker: {
        maxFailures: 5,
        resetTimeout: 30000, // 30 seconds
    },

    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
    },

    // Debug Configuration
    debug: {
        enabled: process.env.DEBUG === 'true',
        verbose: process.env.DEBUG_VERBOSE === 'true',
    },
};

// Validate required environment variables
function validateConfig() {
    const required = ['API_BASE_URL'];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        process.exit(1);
    }

    console.log('✅ Configuration validated successfully');
}

export { config, validateConfig };
