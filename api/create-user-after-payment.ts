import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    if (!email || !accessCode || !paymentId || !planId) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, accessCode, paymentId, planId' 
      });
    }

    // Plan duration mapping
    const PLAN_DURATIONS: Record<string, number> = {
      '1_month': 30,
      '3_months': 90,
      '12_months': 365
    };

    const subscriptionDuration = PLAN_DURATIONS[planId];
    if (!subscriptionDuration) {
      return res.status(400).json({ 
        error: 'Invalid plan ID', 
        received: planId,
        validPlans: Object.keys(PLAN_DURATIONS)
      });
    }

    console.log('Creating KeyAuth user after payment:', { 
      email, 
      paymentId, 
      planId, 
      subscriptionDuration 
    });

    // KeyAuth configuration - استخدم المتغيرات الصحيحة
    const KEYAUTH_CONFIG = {
      name: process.env.KEYAUTH_APP_NAME || "futbot",
      ownerid: process.env.KEYAUTH_OWNER_ID || "",
      secret: process.env.KEYAUTH_APP_SECRET || "",
      version: process.env.KEYAUTH_APP_VERSION || "1.0.0",
      url: "https://keyauth.win/api/1.2/"
    };
    
    const KEYAUTH_SELLER_KEY = process.env.KEYAUTH_SELLER_KEY || '';

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
        sellerKey: KEYAUTH_SELLER_KEY ? `***${KEYAUTH_SELLER_KEY.slice(-4)}` : 'MISSING'
      });
    }

    console.log('KeyAuth Config:', {
      name: KEYAUTH_CONFIG.name,
      ownerid: KEYAUTH_CONFIG.ownerid ? 'SET' : 'MISSING',
      secret: KEYAUTH_CONFIG.secret ? 'SET' : 'MISSING',
      sellerKey: KEYAUTH_SELLER_KEY ? `***${KEYAUTH_SELLER_KEY.slice(-4)} (${KEYAUTH_SELLER_KEY.length} chars)` : 'MISSING'
    });

    // الخطوة 1: إنشاء مفتاح license حقيقي عبر Seller API
    console.log('Creating real license key via Seller API...');
    
    const sellerParams = new URLSearchParams();
    sellerParams.append('sellerkey', KEYAUTH_SELLER_KEY);
    sellerParams.append('type', 'add');
    sellerParams.append('expiry', subscriptionDuration.toString()); // عدد الأيام
    sellerParams.append('amount', '1'); // عدد المفاتيح
    sellerParams.append('level', '1'); // مستوى الاشتراك
    sellerParams.append('mask', 'XXXX-XXXX-XXXX-XXXX'); // شكل المفتاح
    sellerParams.append('format', 'JSON');
    sellerParams.append('note', `Created for ${email} - Plan: ${planId}`);

    const sellerResponse = await axios.post('https://keyauth.win/api/seller/', sellerParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('Seller API Response:', sellerResponse.data);

    let licenseKey: string; // Changed to let for reassignment

    if (!sellerResponse.data.success) {
      console.error('Seller API failed:', sellerResponse.data);
      
      // Fallback: Try App API addkey
      console.log('Trying App API addkey as fallback...');
      
      try {
        // First initialize KeyAuth session
        const initPayload = new URLSearchParams();
        initPayload.append('type', 'init');
        initPayload.append('name', KEYAUTH_CONFIG.name);
        initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
        initPayload.append('secret', KEYAUTH_CONFIG.secret);
        initPayload.append('version', KEYAUTH_CONFIG.version);

        console.log('Initializing KeyAuth session for App API...');
        const initResponse = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!initResponse.data.success) {
          throw new Error(`KeyAuth init failed: ${initResponse.data.message}`);
        }

        const sessionId = initResponse.data.sessionid;
        console.log('KeyAuth session initialized for App API');

        // Now try to create license key
        const appParams = new URLSearchParams();
        appParams.append('type', 'addkey');
        appParams.append('name', KEYAUTH_CONFIG.name);
        appParams.append('ownerid', KEYAUTH_CONFIG.ownerid);
        appParams.append('secret', KEYAUTH_CONFIG.secret);
        appParams.append('sessionid', sessionId);
        appParams.append('expiry', subscriptionDuration.toString());
        appParams.append('mask', '******-******-******-******');
        appParams.append('amount', '1');
        appParams.append('level', '1');
        appParams.append('format', 'JSON');
        
        const appResponse = await axios.post(KEYAUTH_CONFIG.url, appParams, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        console.log('App API Response:', appResponse.data);
        
        if (appResponse.data.success) {
          const appLicenseKey = appResponse.data.key || appResponse.data.keys?.[0];
          if (appLicenseKey) {
            console.log('App API license key created successfully:', appLicenseKey);
            licenseKey = appLicenseKey;
          } else {
            throw new Error('No license key from App API');
          }
        } else {
          throw new Error(appResponse.data.message || 'App API failed');
        }
      } catch (appError) {
        console.error('App API fallback also failed:', appError);
        return res.status(500).json({
          error: 'Failed to create license key via both Seller API and App API',
          sellerError: sellerResponse.data.message,
          appError: appError instanceof Error ? appError.message : String(appError)
        });
      }
    } else {
      // Seller API succeeded
      licenseKey = sellerResponse.data.key || sellerResponse.data.keys?.[0];
      if (!licenseKey) {
        return res.status(500).json({
          error: 'No license key returned from Seller API',
          response: sellerResponse.data
        });
      }
      console.log('License key created successfully via Seller API:', licenseKey);
    }

    // الخطوة 2: Initialize KeyAuth session
    const initPayload = new URLSearchParams();
    initPayload.append('type', 'init');
    initPayload.append('name', KEYAUTH_CONFIG.name);
    initPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    initPayload.append('secret', KEYAUTH_CONFIG.secret);
    initPayload.append('version', KEYAUTH_CONFIG.version);

    console.log('Initializing KeyAuth session...');
    const initResponse = await axios.post(KEYAUTH_CONFIG.url, initPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!initResponse.data.success) {
      console.error('KeyAuth init failed:', initResponse.data);
      return res.status(500).json({
        error: 'KeyAuth initialization failed',
        details: initResponse.data.message
      });
    }

    const sessionId = initResponse.data.sessionid;
    console.log('KeyAuth session initialized');

    // الخطوة 3: تسجيل المستخدم في KeyAuth باستخدام المفتاح الحقيقي
    const registerPayload = new URLSearchParams();
    registerPayload.append('type', 'register');
    registerPayload.append('name', KEYAUTH_CONFIG.name);
    registerPayload.append('ownerid', KEYAUTH_CONFIG.ownerid);
    registerPayload.append('secret', KEYAUTH_CONFIG.secret);
    registerPayload.append('sessionid', sessionId);
    registerPayload.append('username', email); // استخدم الإيميل كاسم مستخدم
    registerPayload.append('pass', accessCode); // الرمز الذي اختاره العميل
    registerPayload.append('key', licenseKey); // المفتاح الحقيقي
    registerPayload.append('email', email);

    console.log('Registering KeyAuth user...');
    const registerResponse = await axios.post(KEYAUTH_CONFIG.url, registerPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('KeyAuth register response:', registerResponse.data);

    if (!registerResponse.data.success) {
      console.error('KeyAuth registration failed:', registerResponse.data);
      return res.status(500).json({
        error: 'KeyAuth user registration failed',
        details: registerResponse.data.message || 'Registration failed'
      });
    }

    console.log('KeyAuth user registered successfully!');

    // الخطوة 4: إرسال إيميل ترحيب مع بيانات الدخول
    const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
    const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        
        const startDate = new Date();
        const expirationDate = new Date(startDate.getTime() + (subscriptionDuration * 24 * 60 * 60 * 1000));
        
        const planNames: Record<string, string> = {
          '1_month': 'شهر واحد',
          '3_months': '3 أشهر', 
          '12_months': 'سنة كاملة'
        };
        
        const emailResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: '🎉 مرحباً بك في FUTBot - حسابك جاهز!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4169E1;">مرحباً بك في FUTBot! 🚀</h2>
              <p>تم تفعيل اشتراكك بنجاح!</p>
              
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3>بيانات الدخول الخاصة بك</h3>
                <p><strong>اسم المستخدم:</strong> ${email}</p>
                <p><strong>كلمة المرور:</strong> ${accessCode}</p>
                <p><strong>مفتاح الترخيص:</strong> ${licenseKey}</p>
                <p><strong>نوع الاشتراك:</strong> ${planNames[planId] || planId}</p>
                <p><strong>تاريخ الانتهاء:</strong> ${expirationDate.toLocaleDateString('ar-SA')}</p>
              </div>
              
              <h3>الخطوات التالية:</h3>
              <ol>
                <li>تحميل إضافة FUTBot للمتصفح</li>
                <li>تسجيل الدخول باستخدام الإيميل وكلمة المرور</li>
                <li>البدء في التداول والربح!</li>
              </ol>
              
              <p>تحتاج مساعدة؟ راسلنا على support@futbot.club</p>
              <p>تداول سعيد!<br/>فريق FUTBot</p>
            </div>
          `
        });
        
        console.log('Welcome email sent:', emailResult);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    // إرجاع النتيجة الناجحة
    res.status(200).json({ 
      success: true, 
      message: 'KeyAuth user created successfully',
      data: {
        email: email,
        username: email,
        licenseKey: licenseKey,
        paymentId: paymentId,
        planId: planId,
        subscriptionDuration: subscriptionDuration,
        expirationDate: new Date(Date.now() + (subscriptionDuration * 24 * 60 * 60 * 1000)).toISOString()
      }
    });

  } catch (error) {
    console.error('KeyAuth user creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create KeyAuth user',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
