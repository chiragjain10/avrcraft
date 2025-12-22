// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Razorpay instance initialize karein
const razorpay = new Razorpay({
  key_id: 'rzp_live_RbM4EwDqfoiR3S',
  key_secret: '78nNYjPM5GXrJHkvSMc3Oekm'
});

// 1. Create Razorpay Order
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { amount, currency = 'INR', notes = {} } = data;

    const options = {
      amount: Math.round(amount), // Paise mein
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: context.auth.uid,
        ...notes
      }
    };

    const order = await razorpay.orders.create(options);

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    };

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create payment order'
    );
  }
});

// 2. Verify Payment Webhook
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const crypto = require('crypto');
    const secret = 'YOUR_WEBHOOK_SECRET_HERE'; // Razorpay dashboard se webhook secret lein

    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      const event = req.body.event;
      const payment = req.body.payload.payment.entity;

      if (event === 'payment.captured') {
        // Payment successful
        const orderId = payment.notes.orderId;
        const paymentId = payment.id;
        
        // Firestore mein order update karein
        const orderRef = admin.firestore().collection('orders').doc(orderId);
        await orderRef.update({
          paymentStatus: 'captured',
          razorpayPaymentId: paymentId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'confirmed'
        });

        // User ko notification bhejein
        const orderDoc = await orderRef.get();
        const orderData = orderDoc.data();
        
        if (orderData.userId) {
          await admin.firestore().collection('users').doc(orderData.userId)
            .collection('notifications').add({
              type: 'payment_success',
              title: 'Payment Successful!',
              message: `Your payment for Order #${orderId} has been confirmed.`,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
      } else if (event === 'payment.failed') {
        // Payment failed
        const orderId = payment.notes.orderId;
        
        const orderRef = admin.firestore().collection('orders').doc(orderId);
        await orderRef.update({
          paymentStatus: 'failed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'payment_failed'
        });
      }

      res.status(200).send('Webhook received');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// 3. Verify Payment Manually
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = data;

    const crypto = require('crypto');
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', 'YOUR_SECRET_KEY_HERE')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified, update Firestore
      const orderRef = admin.firestore().collection('orders').doc(orderId);
      
      await orderRef.update({
        paymentStatus: 'captured',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'confirmed'
      });

      // Clear cart
      const cartRef = admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .collection('cart')
        .doc('items');
      
      await cartRef.delete();

      return {
        success: true,
        verified: true,
        message: 'Payment verified successfully'
      };
    } else {
      return {
        success: false,
        verified: false,
        message: 'Invalid payment signature'
      };
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    throw new functions.https.HttpsError('internal', 'Payment verification failed');
  }
});