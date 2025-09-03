import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, accessCode, paymentId, planId, amount } = req.body;

    // Validate required fields
    if (!email || !accessCode || !paymentId || !planId) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, accessCode, paymentId, planId' 
      });
    }

    // Plan configuration
    const PLANS = {
      '1_month': { name: 'شهر واحد', duration: 30, price: 15.00 },
      '3_months': { name: '3 أشهر', duration: 90, price: 24.99 },
      '12_months': { name: 'سنة كاملة', duration: 365, price: 49.99 }
    };

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return res.status(400).json({ 
        error: 'Invalid plan ID', 
        validPlans: Object.keys(PLANS)
      });
    }

    console.log('🎯 Creating KeyAuth user after payment:', { 
      email, 
      paymentId, 
      planId,
      planName: plan.name,
      duration: plan.duration,
      price: plan.price
    });

    // KeyAuth configuration
    const KEYAUTH_CONFIG = {
      name: process.env.KEYAUTH_APP_NAME || "futbot",
      ownerid: process.env.KEYAUTH_OWNER_ID || "j5oBWrvrnm",
      secret: process.env.KEYAUTH_APP_SECRET || "71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5",
      version: process.env.KEYAUTH_APP_VERSION || "1.0",
      url: "https://keyauth.win/api/1.2/"
    };
    
    const KEYAUTH_SELLER_KEY = process.env.KEYAUTH_SELLER_KEY || 'e5bb8c336379263e3e19f5939357fac6';

    // Validate KeyAuth config
    if (!KEYAUTH_CONFIG.ownerid || !KEYAUTH_CONFIG.secret || !KEYAUTH_SELLER_KEY) {
      return res.status(500).json({
        error: 'KeyAuth configuration incomplete',
        missing: {
          ownerid: !KEYAUTH_CONFIG.ownerid,
          secret: !KEYAUTH_CONFIG.secret,
          sellerKey: !KEYAUTH_SELLER_KEY
        }
      });
    }

    // Validate Seller Key length
    if (KEYAUTH_SELLER_KEY.length !== 32) {
      return res.status(500).json({
        error: 'Invalid Seller Key length',
        details: `Seller key must be exactly 32 characters long, got ${KEYAUTH_SELLER_KEY.length}`,
        sellerKey: `***${KEYAUTH_SELLER_KEY.slice(-4)}`
      });
    }

    console.log('✅ KeyAuth Config validated:', {
      name: KEYAUTH_CONFIG.name,
      ownerid: `***${KEYAUTH_CONFIG.ownerid.slice(-4)}`,
      secret: `***${KEYAUTH_CONFIG.secret.slice(-4)}`,
      sellerKey: `***${KEYAUTH_SELLER_KEY.slice(-4)} (${KEYAUTH_SELLER_KEY.length} chars)`
    });

    // Step 1: Create license key via Seller API
    console.log('🔑 Creating license key via Seller API...');
    
    const sellerParams = new URLSearchParams();
    sellerParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    sellerParams.append('type', 'add');
    sellerParams.append('expiry', plan.duration.toString());
    sellerParams.append('amount', '1');
    sellerParams.append('level', '1');
    sellerParams.append('mask', '******-******-******-******');
    sellerParams.append('format', 'JSON');
    sellerParams.append('note', `Created for ${email} - Plan: ${plan.name}`);

    console.log('📤 Seller API Parameters:', {
      sellerkey: `***${KEYAUTH_SELLER_KEY.slice(-4)}`,
      type: 'add',
      expiry: plan.duration,
      amount: '1',
      level: '1',
      mask: '******-******-******-******'
    });

    const sellerResponse = await axios.post('https://keyauth.win/api/seller/', sellerParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('📥 Seller API Response:', sellerResponse.data);

    if (!sellerResponse.data.success) {
      console.error('❌ Seller API failed:', sellerResponse.data);
      return res.status(500).json({
        error: 'Failed to create license key via Seller API',
        details: sellerResponse.data.message || 'Seller API failed'
      });
    }

    const licenseKey = sellerResponse.data.key || sellerResponse.data.keys?.[0];
    if (!licenseKey) {
      console.error('❌ No license key returned from Seller API');
      return res.status(500).json({
        error: 'No license key returned from Seller API',
        response: sellerResponse.data
      });
    }

    console.log('✅ License key created successfully via Seller API:', licenseKey);

    // Step 2: Initialize KeyAuth session
    const initPayload = new URLSearchParams();
    initPayload.append('type', 'init');
    initPayload.append('name', KEYAUTH_CONFIG.name);
    initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    initPayload.append('secret', KEYAUTH_CONFIG.secret);
    initPayload.append('version', KEYAUTH_CONFIG.version);

    console.log('🔄 Initializing KeyAuth session...');
    const initResponse = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!initResponse.data.success) {
      console.error('❌ KeyAuth init failed:', initResponse.data);
      return res.status(500).json({
        error: 'KeyAuth initialization failed',
        details: initResponse.data.message
      });
    }

    const sessionId = initResponse.data.sessionid;
    console.log('✅ KeyAuth session initialized');

    // Step 3: Register user in KeyAuth
    const registerPayload = new URLSearchParams();
    registerPayload.append('type', 'register');
    registerPayload.append('name', KEYAUTH_CONFIG.name);
    registerPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    registerPayload.append('secret', KEYAUTH_CONFIG.secret);
    registerPayload.append('sessionid', sessionId);
    registerPayload.append('username', email);
    registerPayload.append('pass', accessCode);
    registerPayload.append('key', licenseKey);
    registerPayload.append('email', email);

    console.log('👤 Registering KeyAuth user...');
    const registerResponse = await axios.post(KEYAUTH_CONFIG.url, registerPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('📥 KeyAuth register response:', registerResponse.data);

    if (!registerResponse.data.success) {
      console.error('❌ KeyAuth registration failed:', registerResponse.data);
      return res.status(500).json({
        error: 'KeyAuth user registration failed',
        details: registerResponse.data.message || 'Registration failed'
      });
    }

    console.log('✅ KeyAuth user registered successfully!');

    // Step 4: Send welcome email
    const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_Tok42Hju_AxCRATn2dJGfuz5ekTenM7Rn';
    const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@futbot.club';
    
    // Calculate dates
    const startDate = new Date();
    const expirationDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
    
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        
        const emailResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: '🎉 مرحباً بك في FUTBot - حسابك جاهز!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
              <h2 style="color: #4169E1; text-align: center;">مرحباً بك في FUTBot! 🚀</h2>
              <p style="text-align: center; font-size: 18px;">تم تفعيل اشتراكك بنجاح!</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #4169E1;">
                <h3 style="color: #4169E1; margin-top: 0;">بيانات الدخول الخاصة بك</h3>
                <p><strong>اسم المستخدم:</strong> ${email}</p>
                <p><strong>كلمة المرور:</strong> ${accessCode}</p>
                <p><strong>مفتاح الترخيص:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${licenseKey}</code></p>
                <p><strong>نوع الاشتراك:</strong> ${plan.name}</p>
                <p><strong>المدة:</strong> ${plan.duration} يوم</p>
                <p><strong>السعر:</strong> $${plan.price}</p>
                <p><strong>تاريخ البداية:</strong> ${startDate.toLocaleDateString('ar-SA')}</p>
                <p><strong>تاريخ الانتهاء:</strong> ${expirationDate.toLocaleDateString('ar-SA')}</p>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #28a745;">
                <h3 style="color: #28a745; margin-top: 0;">الخطوات التالية:</h3>
                <ol style="margin: 0; padding-right: 20px;">
                  <li>تحميل إضافة FUTBot للمتصفح</li>
                  <li>تسجيل الدخول باستخدام الإيميل وكلمة المرور</li>
                  <li>البدء في التداول والربح!</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6c757d;">تحتاج مساعدة؟ راسلنا على <a href="mailto:futbott97@gmail.com" style="color: #4169E1;">futbott97@gmail.com</a></p>
                <p style="color: #6c757d; font-weight: bold;">تداول سعيد!<br/>فريق FUTBot</p>
              </div>
            </div>
          `
        });
        
        console.log('✅ Welcome email sent:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
      }
    }

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'KeyAuth user created successfully',
      data: {
        email: email,
        username: email,
        licenseKey: licenseKey,
        paymentId: paymentId,
        planId: planId,
        planName: plan.name,
        subscriptionDuration: plan.duration,
        price: plan.price,
        startDate: startDate.toISOString(),
        expirationDate: expirationDate.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ KeyAuth user creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create KeyAuth user',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
