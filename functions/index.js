const functions = require("firebase-functions");
const admin = require("firebase-admin");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const cors = require("cors")({ origin: true });

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: "rostrodorado-80279.appspot.com"
});

// Initialize Brevo Client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
// apiKey is set dynamically in the function execution to ensure config is loaded 

/**
 * 1. sendOtp
 * Generates a 6-digit code, saves it to Firestore, and sends it via Email (Brevo).
 */
exports.sendOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Method Not Allowed' });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).send({ error: 'Email is required' });
      }

      // Generate 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = admin.firestore.Timestamp.now().toMillis() + 15 * 60 * 1000; // 15 mins

      // Save to Firestore
      await admin.firestore().collection('otp_codes').doc(email).set({
        code: code, // In production, hash this!
        expiresAt: expiresAt,
        attempts: 0
      });

      // Configure Brevo API Key
      const brevoKey = functions.config().brevo ? functions.config().brevo.key : null;

      if (!brevoKey) {
        console.error("Brevo API Key not found in functions config.");
        // Fallback or Error
        return res.status(500).send({ error: 'Server configuration error: Config missing' });
      }

      apiKey.apiKey = brevoKey;
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.subject = "Tu Código de Acceso - Rostro Dorado";
      sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
    
    /* Base Styles */
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Montserrat', Helvetica, Arial, sans-serif; }
    
    /* Container: Always white to ensure logo visibility */
    .container { 
      max-width: 600px; 
      margin: 40px auto; 
      background-color: #ffffff; 
      padding: 60px 20px; 
      border-radius: 4px; /* Slightly rounded, barely visible like the reference */
      text-align: center;
    }

    /* Minimalist Logo */
    .logo-img { max-height: 90px; width: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; }
    
    /* Content Typography */
    .intro-text { color: #333333; font-size: 16px; margin-bottom: 30px; font-weight: 400; }
    
    .code-display { 
      font-family: 'Montserrat', sans-serif;
      font-size: 48px; 
      color: #111111; 
      letter-spacing: 15px; 
      font-weight: 700; 
      margin: 20px 0;
      line-height: 1;
    }
    
    .expiry-text { font-size: 14px; color: #666666; margin-top: 20px; margin-bottom: 50px; font-weight: 300; }
    
    /* Footer */
    .footer { border-top: 1px solid #eeeeee; padding-top: 30px; margin-top: 20px; }
    .footer-text { color: #999999; font-size: 12px; margin-bottom: 10px; }
    .footer-link { color: #C6A87C; text-decoration: none; font-size: 12px; font-weight: 500; }

    /* Dark Mode Overrides - Only affecting the background, NOT the card */
    @media (prefers-color-scheme: dark) {
      body { background-color: #1a1a1a !important; }
      /* We keep .container WHITE even in dark mode so the Black Text logo is visible */
      .container { background-color: #ffffff !important; box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; word-spacing: normal;">
  <!-- Wrapper Table for Full background control -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        
        <!-- Main Card Container: Force White Background with table -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; width: 100%;">
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 40px 0 30px 0;">
              <img src="https://i.imgur.com/93IWNqy.png" alt="Rostro Dorado Clinic" width="220" style="display: block; width: 220px; max-width: 100%; height: auto; border: 0;" />
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <p style="font-family: 'Montserrat', sans-serif;font-size: 16px; color: #333333; margin: 0 0 30px 0; font-weight: 400;">
                Tu código de verificación:
              </p>
              
              <div style="font-family: 'Montserrat', sans-serif; font-size: 48px; color: #111111; letter-spacing: 12px; font-weight: 700; margin: 20px 0; line-height: 1;">
                ${code}
              </div>
              
              <p style="font-family: 'Montserrat', sans-serif; font-size: 14px; color: #666666; margin: 40px 0 50px 0; font-weight: 300;">
                Este código solo se puede usar una vez. Vencerá en 15 minutos.
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td align="center" style="border-top: 1px solid #eeeeee; padding: 30px 40px 40px 40px;">
              
              <!-- Social Links Restored -->
              <div style="margin-bottom: 20px;">
                <a href="https://www.instagram.com/rostrodoradoclinic/" style="color: #111111; text-decoration: none; margin: 0 10px; font-weight: 600; font-size: 10px; letter-spacing: 2px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">INSTAGRAM</a>
                <span style="color: #cccccc;">|</span>
                <a href="https://www.facebook.com/people/Dra-Isaura-Dorado/100067023886893/" style="color: #111111; text-decoration: none; margin: 0 10px; font-weight: 600; font-size: 10px; letter-spacing: 2px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">FACEBOOK</a>
                <span style="color: #cccccc;">|</span>
                <a href="https://www.tiktok.com/@draisauradorado" style="color: #111111; text-decoration: none; margin: 0 10px; font-weight: 600; font-size: 10px; letter-spacing: 2px; font-family: 'Montserrat', sans-serif; text-transform: uppercase;">TIKTOK</a>
              </div>

              <p style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #999999; margin: 0;">
                &copy; ${new Date().getFullYear()} ROSTRO DORADO CLINIC
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
      sendSmtpEmail.sender = { "name": "Rostro Dorado Clinic", "email": "no-reply@rostrodorado.com" };
      sendSmtpEmail.to = [{ "email": email }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);

      return res.status(200).send({ success: true, message: 'OTP sent' });

    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).send({ error: error.message });
    }
  });
});

/**
 * 2. verifyOtp
 * Verifies the code. If valid, generates a Custom Auth Token.
 */
exports.verifyOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Method Not Allowed' });
      }

      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).send({ error: 'Email and Code are required' });
      }

      const docRef = admin.firestore().collection('otp_codes').doc(email);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(400).send({ error: 'Invalid code or expired' });
      }

      const data = doc.data();
      const now = Date.now();

      if (now > data.expiresAt) {
        return res.status(400).send({ error: 'Code expired' });
      }

      if (data.code !== code) {
        // Increment attempts (optional security)
        await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
        return res.status(400).send({ error: 'Invalid code' });
      }

      // Code is valid!
      // 1. Create/Get User
      let uid;
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        uid = userRecord.uid;
      } catch (e) {
        // User doesn't exist? Create them (or handle as error if you want strict signup)
        if (e.code === 'auth/user-not-found') {
          const newUser = await admin.auth().createUser({ email: email });
          uid = newUser.uid;
        } else {
          throw e;
        }
      }

      // 2. Mint Custom Token
      const customToken = await admin.auth().createCustomToken(uid);

      // 3. Delete OTP (prevent replay)
      await docRef.delete();

      return res.status(200).send({ token: customToken });

    } catch (error) {
      console.error("Error verification:", error);
      return res.status(500).send({ error: error.message });
    }
  });
});

/**
 * 3. sendOrderConfirmation
 * Triggers when an order is updated to 'processing' (Paid).
 * Sends a confirmation email/invoice to the user.
 */
const PDFDocument = require('pdfkit');

const createInvoicePdf = async (order, orderId) => {
  return new Promise(async (resolve, reject) => {
    // 4x6 inches = 101.6mm x 152.4mm
    // 1 inch = 72 points. 
    // 4 inches = 288 points
    // 6 inches = 432 points

    const doc = new PDFDocument({
      size: [288, 432], // 4x6 inches
      margin: 15        // Tight margin for thermal receipt
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // -- PDF Content: Thermal Receipt Style --

    const startX = 15;
    const endX = 273; // 288 - 15
    const centerX = 144; // 288 / 2

    // Set Font to Courier for that receipt look
    doc.font('Courier');

    // 1. Logo
    try {
      const logoUrl = 'https://i.imgur.com/93IWNqy.png';
      const response = await fetch(logoUrl);
      const arrayBuffer = await response.arrayBuffer();
      const logoBuffer = Buffer.from(arrayBuffer);

      // Fit logo within a reasonable width, centered
      // Very small logo for thermal receipt header
      doc.image(logoBuffer, centerX - 25, doc.y, { width: 50 });
      // Move down by image height (50) + padding (10)
      doc.y += 60;
    } catch (e) {
      // Fallback if image fails
      console.error("Error loading logo:", e);
      doc.fontSize(14).font('Courier-Bold');
      const title = 'ROSTRO DORADO';
      const titleWidth = doc.widthOfString(title);
      const titleX = (288 - titleWidth) / 2;
      doc.rect(titleX - 5, doc.y - 3, titleWidth + 10, 20).stroke();
      doc.text(title, titleX, doc.y);
      doc.moveDown(1.5);
    }

    // 2. Subheader
    doc.fontSize(8).font('Courier');
    doc.text('Nit: 1124048278-9', { align: 'center' });
    doc.text('Calle 12 #12-03 local 2', { align: 'center' });
    doc.text('Riohacha, La Guajira', { align: 'center' });
    doc.moveDown(1.5);

    // Line Separator
    doc.moveTo(startX, doc.y).lineTo(endX, doc.y).stroke();
    doc.moveDown(1);

    // 3. Receipt Details
    doc.fontSize(9).font('Courier-Bold');

    let currentY = doc.y;
    doc.text('Recibo No:', startX, currentY);
    doc.text(`#${orderId.slice(0, 8).toUpperCase()}`, startX, currentY, { align: 'right' }); // Align right to end margin? PDFKit aligns relative to start position if width not specified? No, logic needs width for right align.
    // Better way for single line split:
    doc.text(`#${orderId.slice(0, 8).toUpperCase()}`, 100, currentY, { align: 'right', width: 173 });

    doc.moveDown(0.5);
    currentY = doc.y;
    doc.text('Fecha:', startX, currentY);
    doc.text(new Date().toLocaleDateString('es-CO'), 100, currentY, { align: 'right', width: 173 });
    doc.moveDown(1.5);

    // 4. Customer Info
    doc.text('CLIENTE:', startX);
    doc.moveDown(0.5);
    doc.font('Courier');
    doc.fontSize(8);
    // Limit width to avoid overwrite
    const textOptions = { width: 258, align: 'left' };

    doc.text((order.customer.name || '').toUpperCase(), textOptions);
    doc.text((order.customer.address || '').toUpperCase() + (order.customer.apartment ? ` APTO ${order.customer.apartment}` : ''), textOptions);
    doc.text(`${order.customer.city || ''}, ${order.customer.department || ''}`.toUpperCase(), textOptions);
    doc.text(`Tel: ${order.customer.phone || ''}`, textOptions);
    doc.moveDown(1.5);

    // Line Separator
    doc.moveTo(startX, doc.y).lineTo(endX, doc.y).stroke();
    doc.moveDown(1);

    // 5. Items Header
    currentY = doc.y;
    doc.fontSize(8).font('Courier-Bold');
    doc.text('DESCR', startX, currentY);
    doc.text('CANT', 180, currentY, { width: 30, align: 'center' });
    doc.text('TOTAL', 220, currentY, { width: 53, align: 'right' });
    doc.moveDown(0.5);

    // Items List
    doc.font('Courier');
    order.items.forEach(item => {
      currentY = doc.y;
      doc.text(item.name.substring(0, 25), startX, currentY, { width: 160 });
      doc.text(item.quantity.toString(), 180, currentY, { width: 30, align: 'center' });
      doc.text(`$${(item.price * item.quantity).toLocaleString('es-CO')}`, 220, currentY, { width: 53, align: 'right' });
      doc.moveDown(0.5);
    });
    doc.moveDown(1);

    // Dotted Separator
    doc.save();
    doc.dash(2, { space: 2 });
    doc.moveTo(startX, doc.y).lineTo(endX, doc.y).stroke();
    doc.restore();
    doc.moveDown(1);

    // 6. Totals
    currentY = doc.y;
    doc.font('Courier-Bold').fontSize(10);
    doc.text('TOTAL:', startX, currentY);
    doc.text(`$${order.total.toLocaleString('es-CO')}`, 150, currentY, { width: 123, align: 'right' });
    doc.moveDown(0.5);

    // Payment Method Mapping
    const PAYMENT_METHODS = {
      'CARD': 'TARJETA CRÉDITO/DÉBITO',
      'NEQUI': 'NEQUI',
      'PSE': 'PSE',
      'BANCOLOMBIA': 'BANCOLOMBIA',
      'BANCOLOMBIA_TRANSFER': 'TRANSF. BANCOLOMBIA',
      'BANCOLOMBIA_COLLECT': 'CORRESPONSAL BANCOLOMBIA',
      'DAVIPLATA': 'DAVIPLATA',
      'wompi': 'ONLINE'
    };

    const paymentText = PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod.toUpperCase() || 'ONLINE';

    doc.fontSize(8).font('Courier');
    currentY = doc.y;
    doc.text('Pago:', startX, currentY);
    doc.text(paymentText, 150, currentY, { width: 123, align: 'right' });
    doc.moveDown(2);

    // Bottom Line
    doc.moveTo(startX, doc.y).lineTo(endX, doc.y).stroke();
    doc.moveDown(1.5);

    // 7. Footer
    doc.fontSize(8).font('Courier-Bold');
    doc.text('¡GRACIAS POR SU COMPRA!', 0, doc.y, { align: 'center', width: 288 });
    doc.moveDown(0.5);
    doc.fontSize(7).font('Courier');
    doc.text('Comprobante de pago electrónico.', 0, doc.y, { align: 'center', width: 288 });
    doc.moveDown(1);
    doc.text('ROSTRO DORADO CLINIC', 0, doc.y, { align: 'center', width: 288 });

    doc.end();
  });
};

exports.sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const orderId = context.params.orderId;

    console.log(`[DEBUG] Order Update Detected: ${orderId}`);
    console.log(`[DEBUG] Status Change: ${previousData.status} -> ${newData.status}`);

    // Trigger only when status changes to 'processing' (Approved Payment)
    if (newData.status === 'processing' && previousData.status !== 'processing') {
      const email = newData.customer.email;
      const name = newData.customer.name;

      console.log(`Sending confirmation email for order ${orderId} to ${email}`);

      // --- SHIPPING GENERATION (ENVIOCLICK) ---
      let trackingInfo = null;
      try {
        if (newData.total > 0) {
          const shipmentResult = await envioclick.createShipment({
            customer: newData.customer,
            items: newData.items,
            total: newData.total,
            shippingOption: newData.shippingOption
          });

          if (shipmentResult.success) {
            console.log("Envioclick Shipment Created:", shipmentResult);
            trackingInfo = {
              number: shipmentResult.trackingNumber,
              url: shipmentResult.labelUrl,
              carrier: shipmentResult.carrier
            };

            await change.after.ref.update({
              trackingNumber: trackingInfo.number,
              shippingLabelUrl: trackingInfo.url,
              shippingProvider: shipmentResult.carrier || 'Envioclick',
              shippingGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // --- TODO: NOTIFICATIONS (INACTIVE) ---
            // Future implementation:
            // await sendWhatsappNotification(newData.customer.phone, trackingInfo);
            // await sendTrackingEmail(newData.customer.email, trackingInfo);
            // --------------------------------------
          }
        }
      } catch (shipError) {
        console.error("Shipping Generation Failed (Envioclick):", shipError);
        // Continue to send email anyway
      }
      // ---------------------------

      try {
        // Generate PDF
        const pdfBuffer = await createInvoicePdf(newData, orderId);
        const pdfBase64 = pdfBuffer.toString('base64');

        const bizSdk = require('facebook-nodejs-business-sdk');

        const brevoKey = functions.config().brevo ? functions.config().brevo.key : null;
        if (!brevoKey) {
          console.error("Brevo Key missing");
          return null;
        }

        // --- FACEBOOK CAPI INTEGRATION ---
        try {
          const accessToken = 'EAAQjIlSbKvYBQWmvgzajCMib2mDJVZAwcKaai6BWjOFq94ftzZBmV092yxMDu7HsR3UwfCsTyMFZAnWtChvUemJFHgnybJSeCWMjf58e330961DmKIcCKNRzXgZBjlfEvslncwbjIsZBQQYBLjPVnuywjaZAUWtXm7ZBzbqSHGd0HerzDIEybZAVOoPO8LxReJ80KwZDZD';
          const pixelId = '834940366041575';
          const api = bizSdk.FacebookAdsApi.init(accessToken);

          const ServerEvent = bizSdk.ServerEvent;
          const EventRequest = bizSdk.EventRequest;
          const UserData = bizSdk.UserData;
          const CustomData = bizSdk.CustomData;
          const Content = bizSdk.Content;

          const currentTimestamp = Math.floor(new Date().getTime() / 1000);

          const userData = (new UserData())
            .setEmail(newData.customer.email)
            .setPhone(newData.customer.phone || '')
            .setFirstName(newData.customer.name ? newData.customer.name.split(' ')[0] : '')
            .setLastName(newData.customer.name ? newData.customer.name.split(' ').slice(1).join(' ') : '')
            .setCity(newData.customer.city || '')
            .setState(newData.customer.department || '')
            .setCountry('co'); // Colombia hardcoded for now

          const contentList = newData.items.map(item => (
            (new Content())
              .setId(item.id || item.name)
              .setQuantity(item.quantity)
              .setTitle(item.name)
              .setItemPrice(item.price)
          ));

          const customData = (new CustomData())
            .setContents(contentList)
            .setCurrency('COP')
            .setValue(newData.total);

          const serverEvent = (new ServerEvent())
            .setEventName('Purchase')
            .setEventTime(currentTimestamp)
            .setUserData(userData)
            .setCustomData(customData)
            .setEventSourceUrl('https://rostrodorado-clinic.web.app/')
            .setActionSource('website');

          const eventsData = [serverEvent];
          const eventRequest = (new EventRequest(accessToken, pixelId))
            .setEvents(eventsData);

          eventRequest.execute().then(
            response => {
              console.log('Facebook CAPI response: ', response);
            },
            err => {
              console.error('Facebook CAPI Error: ', err);
            }
          );

        } catch (fbError) {
          console.error("Facebook CAPI Integration Failed:", fbError);
          // Don't block email sending if FB fails
        }
        // ---------------------------------

        apiKey.apiKey = brevoKey;
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = `Confirmación de Pedido #${orderId.slice(0, 8).toUpperCase()} - Rostro Dorado`;
        sendSmtpEmail.sender = { "name": "Rostro Dorado Clinic", "email": "no-reply@rostrodorado.com" };
        sendSmtpEmail.to = [{ "email": email, "name": name }];

        sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
    
    /* Base Styles */
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Montserrat', Helvetica, Arial, sans-serif; }
    
    /* Container */
    .container { 
      max-width: 600px; 
      margin: 40px auto; 
      background-color: #ffffff; 
      padding: 60px 40px; 
      border-radius: 4px; 
      text-align: center;
      border-top: 4px solid #C6A87C;
    }

    /* Logo */
    .logo-img { max-height: 80px; width: auto; margin-bottom: 40px; display: block; margin-left: auto; margin-right: auto; }
    
    /* Typography */
    h1 { font-family: 'Lora', serif; color: #111111; font-size: 24px; margin-bottom: 10px; font-weight: 500; }
    p { color: #666666; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
    
    /* Order Details */
    .order-summary { background-color: #f9f9f9; padding: 30px; border-radius: 4px; margin: 30px 0; text-align: left; }
    .order-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #333; }
    .order-total { border-top: 1px solid #ddd; margin-top: 15px; padding-top: 15px; font-weight: 600; font-size: 16px; display: flex; justify-content: space-between; }
    
    /* Button */
    .btn { 
      display: inline-block; 
      background-color: #111111; 
      color: #ffffff; 
      padding: 15px 30px; 
      text-decoration: none; 
      font-size: 12px; 
      font-weight: 600; 
      letter-spacing: 1px; 
      text-transform: uppercase; 
      border-radius: 2px;
      margin-top: 20px;
    }
    
    /* Footer */
    .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
    .footer a { color: #C6A87C; text-decoration: none; margin: 0 5px; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="padding: 40px;">
              
              <!-- Logo -->
              <img src="https://i.imgur.com/93IWNqy.png" alt="Rostro Dorado" width="200" style="display: block; width: 200px; max-width: 100%; margin-bottom: 20px;" />
              
              <!-- Title -->
              <h1 style="font-family: 'Lora', serif; font-size: 24px; color: #111; margin-bottom: 20px;">Confirmación de Pedido</h1>
              
              <p>Hola ${name.split(' ')[0]},</p>
              <p>Gracias por tu compra. Hemos recibido tu pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> y lo estamos procesando.</p>
              
              <!-- Attachment Note -->
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #555;">
                📎 <strong>Factura Adjunta:</strong> Encontrarás tu factura electrónica en formato PDF adjunta a este correo.
              </div>

              <!-- CTA -->
              <a href="https://rostrodorado.com/mis-pedidos" style="background-color: #111; color: #fff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; display: inline-block; border-radius: 2px; margin-top: 10px;">
                Ver Mis Pedidos
              </a>

              ${trackingInfo ? `
              <div style="margin-top: 30px; border-top: 1px dashed #eee; padding-top: 20px;">
                  <p style="font-weight: 600; color: #111; margin-bottom: 5px;">Tu Guía de Rastreo:</p>
                  <p style="font-family: 'Courier New', monospace; font-size: 18px; color: #111; letter-spacing: 2px; background: #f0f0f0; display: inline-block; padding: 5px 10px; border-radius: 4px;">${trackingInfo.number}</p>
                  <p style="font-size: 12px; margin-top: 5px;">Transportadora: ${trackingInfo.carrier || 'Envioclick'}</p>
                  ${trackingInfo.url ? `<p><a href="${trackingInfo.url}" style="color: #C6A87C; text-decoration: underline;">Descargar Rótulo</a></p>` : ''}
              </div>
              ` : ''}
              
              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #999;">
                <p>Rostro Dorado Clinic • Riohacha, Colombia</p>
                <p>
                  <a href="https://rostrodorado.com" style="color: #C6A87C; text-decoration: none;">Sitio Web</a> | 
                  <a href="https://www.instagram.com/rostrodoradoclinic/" style="color: #C6A87C; text-decoration: none;">Instagram</a>
                </p>
              </div>
              
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

        sendSmtpEmail.attachment = [
          {
            content: pdfBase64,
            name: `Factura_${orderId.slice(0, 8)}.pdf`
          }
        ];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email with invoice sent successfully");

      } catch (error) {
        console.error("Error sending email:", error);
      }
    }
  });

/**
 * 4. downloadInvoicePdf
 * Callable function for frontend to download the PDF directly.
 */
exports.downloadInvoicePdf = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { orderId } = data;
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Order ID is required');
  }

  try {
    const docSnap = await admin.firestore().collection('orders').doc(orderId).get();

    if (!docSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const order = docSnap.data();

    // Verify Ownership or Admin permission
    // Note: Simplistic check. Ideally check for admin custom claim if available.
    // Here we check if the requestor's email matches the order email.
    const requestorEmail = context.auth.token.email;
    const isOwner = order.customer.email === requestorEmail || (order.userId && order.userId === context.auth.uid);

    // If not owner, we might check if they are admin. 
    // Since we don't have a global isAdmin helper here, we rely on the security that typically only admins or owners can access the order data on frontend to even get the ID.
    // But for safety, we enforce owner check. If admin needs access, ensure admin email is authorized.
    // For now, we allow if email matches.

    if (!isOwner) {
      // If strict security is needed, throw error. 
      // For this specific app context where admin might want to download:
      // We'll trust that if they have the ID and are auth'd, and we are in a rush, we might skip strict admin check OR 
      // better: Check if the user is in the 'users' collection with role: 'admin'
      const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
      const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

      if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Not allowed to access this invoice');
      }
    }

    const pdfBuffer = await createInvoicePdf(order, orderId);
    return { pdfBase64: pdfBuffer.toString('base64') };

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new functions.https.HttpsError('internal', 'Unable to generate PDF');
  }
});

/**
 * 5. facebookProductFeed
 * Generates an XML feed for Facebook/Instagram/WhatsApp Catalog.
 * URL: https://us-central1-rostrodorado-80279.cloudfunctions.net/facebookProductFeed
 */
// Helper to map internal categories to Google Taxonomy
function getGoogleCategory(categoryName) {
  const mapping = {
    'Cuidado Facial': 'Health & Beauty > Personal Care > Cosmetics > Skin Care',
    'Cuidado Corporal': 'Health & Beauty > Personal Care > Cosmetics > Bath & Body',
    'Protección Solar': 'Health & Beauty > Personal Care > Cosmetics > Skin Care > Sunscreen',
    'Capilar': 'Health & Beauty > Personal Care > Hair Care',
    'Nutrición': 'Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements'
  };
  return mapping[categoryName] || 'Health & Beauty > Personal Care';
}

exports.facebookProductFeed = functions.https.onRequest(async (req, res) => {
  try {
    const productsSnapshot = await admin.firestore().collection('products').get();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Rostro Dorado Clinic Products</title>
<link>https://rostrodorado.com</link>
<description>Medical and aesthetic products from Rostro Dorado Clinic</description>
`;

    productsSnapshot.forEach(doc => {
      const p = doc.data();
      // Availability logic
      const availability = (p.stock && p.stock > 0) ? 'in stock' : 'out of stock';

      // Build Rich Description
      let richDescription = p.description || p.longDescription || p.name;
      if (p.benefits) richDescription += `\n\nBeneficios: ${p.benefits}`;
      if (p.ingredients) richDescription += `\n\nIngredientes Clave: ${p.ingredients}`;
      if (p.usage) richDescription += `\n\nModo de Uso: ${p.usage}`;

      // Clean HTML tags if any (basic regex)
      richDescription = richDescription.replace(/<[^>]*>?/gm, '');

      xml += `<item>
<g:id>${doc.id}</g:id>
<g:title><![CDATA[${p.name}]]></g:title>
<g:description><![CDATA[${richDescription}]]></g:description>
<g:link>https://rostrodorado.com/productos/${doc.id}</g:link>
<g:image_link>${p.image}</g:image_link>
<g:brand>Rostro Dorado</g:brand>
<g:condition>new</g:condition>
<g:availability>${availability}</g:availability>
<g:price>${p.price} COP</g:price>
<g:google_product_category><![CDATA[${getGoogleCategory(p.category)}]]></g:google_product_category>
<g:mpn>${doc.id}</g:mpn>
</item>
`;
    });

    xml += `</channel>
</rss>`;

    res.set('Content-Type', 'application/xml');
    res.status(200).send(xml);

  } catch (error) {
    console.error("Error generating feed:", error);
    res.status(500).send("Error generating feed");
  }
});




/**
 * 6. calculateShipping
 * Callable function to get shipping quote from MiPaquete
 */

const envioclick = require('./envioclick');

exports.calculateShipping = functions.https.onCall(async (data, context) => {
  try {
    const { city, department, items } = data;
    console.log("Calculating shipping (Envioclick) for:", city, department);
    console.log("Items received:", JSON.stringify(items));

    // 1. Verify Items & Weight from Firestore (Security & Accuracy)
    let verifiedItems = [];
    let totalWeightKg = 0;

    if (items && Array.isArray(items)) {
      const productIds = items.map(i => i.id).filter(id => id);

      // Fetch all products in parallel
      const productDocs = await Promise.all(
        productIds.map(id => admin.firestore().collection('products').doc(id).get())
      );

      verifiedItems = items.map(item => {
        const productDoc = productDocs.find(doc => doc.id === item.id);
        const productData = productDoc && productDoc.exists ? productDoc.data() : null;

        // Weight in DB is likely GRAMS (e.g. 150). Convert to KG.
        // Fallback to 0.5kg if missing.
        let weightKg = 0.5;
        if (productData && productData.weight) {
          weightKg = parseFloat(productData.weight) / 1000; // Grams -> Kg
        }

        totalWeightKg += weightKg * (item.quantity || 1);

        return {
          ...item,
          price: productData ? productData.price : item.price,
          weight: weightKg,
          dimensions: productData ? productData.dimensions : null // Pass dimensions
        };
      });
    }

    // Min weight for carrier usually 0.5kg
    if (totalWeightKg < 0.5) totalWeightKg = 0.5;

    console.log(`Verified Total Weight: ${totalWeightKg} KG`);

    // 2. Call Envia with verified items/weight
    // We pass the pre-calculated weight to envia.quoteShipping via a special property or let it recalculate
    // Check envia.js: it sums 'weight'. So we just pass verifiedItems which now have 'weight' in KG.
    const result = await envioclick.quoteShipping({ city, department, items: verifiedItems });

    if (result.success) {
      return { success: true, quotes: result.quotes };
    } else {
      console.error("Envioclick Quote Failure:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error calculating shipping:", error);
    return { success: false, error: "Error interno al calcular envío: " + error.message };
  }
});


// Import Tracking Logic
const { updateTracking } = require('./tracking');

/**
 * 6. Scheduled Tracking Update
 * Runs every 2 hours to update status of processing orders.
 */
exports.checkShipmentStatus = functions.pubsub.schedule('every 2 hours').onRun(async (context) => {
  console.log("Running Scheduled Tracking Update...");
  await updateTracking();
  return null;
});
exports.retryShipmentGeneration = functions.https.onCall(async (data, context) => {
  // 1. Auth Check (Ideally Admin only)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  // Simplistic admin check: allow any auth user for now or check email domain/claims
  // const email = context.auth.token.email;
  // if (!isAdmin(email)) ...

  const { orderId } = data;
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with an "orderId".');
  }

  try {
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found.');
    }

    const orderData = orderDoc.data();

    if (orderData.trackingNumber) {
      return { success: false, message: "Order already has a tracking number." };
    }

    // Attempt Shipment Creation
    const shipmentResult = await envioclick.createShipment({
      customer: orderData.customer,
      items: orderData.items,
      total: orderData.total,
      shippingOption: orderData.shippingOption
    });

    if (shipmentResult.success) {
      const trackingInfo = {
        number: shipmentResult.trackingNumber,
        url: shipmentResult.labelUrl
      };

      await orderRef.update({
        trackingNumber: trackingInfo.number,
        shippingLabelUrl: trackingInfo.url,
        shippingProvider: shipmentResult.carrier || 'Envioclick',
        shippingGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, trackingNumber: trackingInfo.number };
    } else {
      throw new functions.https.HttpsError('internal', 'Envioclick API Failed: ' + (shipmentResult.error?.message || 'Unknown error'));
    }

  } catch (error) {
    console.error("Retry Shipment Error:", error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
