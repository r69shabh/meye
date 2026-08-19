exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    port: 4723, // Appium default port
    
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './qa/mobile/*.js'
    ],
    exclude: [],
    
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        // Appium capabilities for Android
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        // 'appium:app': '/path/to/your.apk', // Update this with your actual APK path when testing locally
        'appium:browserName': 'Chrome' // Testing the web app via Chrome on Android
    }],
    
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost:5173',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    services: [
        // 'appium'
    ],
    
    framework: 'mocha',
    reporters: ['spec'],
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
}
