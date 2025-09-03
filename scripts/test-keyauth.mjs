#!/usr/bin/env node

/**
 * KeyAuth API Test Script
 * Tests KeyAuth initialization, license creation, and user registration
 */

import axios from 'axios';

// KeyAuth configuration
const KEYAUTH_CONFIG = {
  name: "futbot",
  ownerid: "j5oBWrvrnm",
  secret: "71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5",
  version: "1.0",
  url: "https://keyauth.win/api/1.2/"
};

const KEYAUTH_SELLER_KEY = 'e5bb8c336379263e3e19f5939357fac6';

console.log('🧪 Testing KeyAuth API...\n');

// Test 1: Initialize KeyAuth session
async function testInit() {
  console.log('🔄 Test 1: Initializing KeyAuth session...');
  
  try {
    const initPayload = new URLSearchParams();
    initPayload.append('type', 'init');
    initPayload.append('name', KEYAUTH_CONFIG.name);
    initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    initPayload.append('secret', KEYAUTH_CONFIG.secret);
    initPayload.append('version', KEYAUTH_CONFIG.version);

    const response = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('✅ Init Response:', response.data);
    
    if (response.data.success) {
      return response.data.sessionid;
    } else {
      throw new Error(response.data.message || 'Init failed');
    }
  } catch (error) {
    console.error('❌ Init failed:', error.message);
    return null;
  }
}

// Test 2: Create license key via Seller API
async function testSellerAPI() {
  console.log('\n🔑 Test 2: Creating license key via Seller API...');
  
  try {
    const sellerParams = new URLSearchParams();
    sellerParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    sellerParams.append('type', 'add');
    sellerParams.append('expiry', '30'); // 30 days
    sellerParams.append('amount', '1');
    sellerParams.append('level', '1');
    sellerParams.append('mask', '******-******-******-******');
    sellerParams.append('format', 'JSON');
    sellerParams.append('note', 'Test license creation');

    const response = await axios.post('https://keyauth.win/api/seller/', sellerParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('✅ Seller API Response:', response.data);
    
    if (response.data.success) {
      return response.data.key || response.data.keys?.[0];
    } else {
      throw new Error(response.data.message || 'Seller API failed');
    }
  } catch (error) {
    console.error('❌ Seller API failed:', error.message);
    return null;
  }
}

// Test 3: Create license key via App API
async function testAppAPI(sessionId) {
  console.log('\n🔑 Test 3: Creating license key via App API...');
  
  try {
    const appParams = new URLSearchParams();
    appParams.append('type', 'addkey');
    appParams.append('name', KEYAUTH_CONFIG.name);
    appParams.append('ownerid', KEYAUTH_CONFIG.ownerid);
    appParams.append('secret', KEYAUTH_CONFIG.secret);
    appParams.append('sessionid', sessionId);
    appParams.append('expiry', '30'); // 30 days
    appParams.append('mask', '******-******-******-******');
    appParams.append('amount', '1');
    appParams.append('level', '1');
    appParams.append('format', 'JSON');
    
    const response = await axios.post(KEYAUTH_CONFIG.url, appParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('✅ App API Response:', response.data);
    
    if (response.data.success) {
      return response.data.key || response.data.keys?.[0];
    } else {
      throw new Error(response.data.message || 'App API failed');
    }
  } catch (error) {
    console.error('❌ App API failed:', error.message);
    return null;
  }
}

// Test 4: Register test user
async function testRegistration(sessionId, licenseKey) {
  console.log('\n👤 Test 4: Registering test user...');
  
  try {
    const registerPayload = new URLSearchParams();
    registerPayload.append('type', 'register');
    registerPayload.append('name', KEYAUTH_CONFIG.name);
    registerPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    registerPayload.append('secret', KEYAUTH_CONFIG.secret);
    registerPayload.append('sessionid', sessionId);
    registerPayload.append('username', 'test@example.com');
    registerPayload.append('pass', 'testpass123');
    registerPayload.append('key', licenseKey);
    registerPayload.append('email', 'test@example.com');

    const response = await axios.post(KEYAUTH_CONFIG.url, registerPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('✅ Registration Response:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting KeyAuth API tests...\n');
  
  // Test 1: Init
  const sessionId = await testInit();
  if (!sessionId) {
    console.log('\n❌ Cannot continue without valid session');
    return;
  }
  
  // Test 2: Seller API
  let licenseKey = await testSellerAPI();
  
  // Test 3: App API (if Seller API failed)
  if (!licenseKey) {
    console.log('\n🔄 Seller API failed, trying App API...');
    licenseKey = await testAppAPI(sessionId);
  }
  
  if (!licenseKey) {
    console.log('\n❌ Cannot continue without valid license key');
    return;
  }
  
  // Test 4: Registration
  const registrationSuccess = await testRegistration(sessionId, licenseKey);
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('✅ Session ID:', sessionId ? 'Valid' : 'Failed');
  console.log('✅ License Key:', licenseKey ? 'Created' : 'Failed');
  console.log('✅ User Registration:', registrationSuccess ? 'Success' : 'Failed');
  
  if (sessionId && licenseKey && registrationSuccess) {
    console.log('\n🎉 All tests passed! KeyAuth integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run tests
runTests().catch(console.error);
