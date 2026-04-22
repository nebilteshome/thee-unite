import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('THEE UNITE Payment Server is running');
});

/**
 * Flutterwave Webhook Endpoint
 */
app.post('/webhook/flutterwave', async (req, res) => {
  const signature = req.headers['verif-hash'];
  
  // Verify the authenticity of the webhook
  if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
    console.warn('Unauthorized webhook attempt detected');
    return res.status(401).send('Invalid signature');
  }

  const payload = req.body;
  const { status, tx_ref, id } = payload;

  console.log(`Webhook received: ${status} for transaction ${tx_ref}`);

  if (status === 'successful') {
    try {
      // Verify transaction with Flutterwave API to prevent spoofing
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${id}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'success' && data.data.status === 'successful') {
        const verifiedAmount = data.data.amount;
        const currency = data.data.currency;
        
        // PAYMENT VERIFIED SUCCESSFULLY!
        console.log(`[VERIFIED] Payment of ${verifiedAmount} ${currency} confirmed for ${tx_ref}`);
        
        // Update Firestore to mark order as paid
        const ordersRef = db.collection('orders');
        const q = await ordersRef.where('payment.reference', '==', tx_ref).limit(1).get();

        if (!q.empty) {
          const orderDoc = q.docs[0];
          await orderDoc.ref.update({
            status: 'paid',
            'payment.webhook_verified': true,
            'payment.flutterwave_id': id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Order ${orderDoc.id} marked as paid.`);
        } else {
          console.warn(`Order with reference ${tx_ref} not found in Firestore.`);
          
          // Optional: Create a "ghost" order or log for reconciliation
          await db.collection('payment_logs').add({
            tx_ref,
            flutterwave_id: id,
            status: 'verified_but_no_order',
            amount: verifiedAmount,
            currency,
            receivedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
      } else {
        console.warn(`[FAILED] Transaction verification failed for ID: ${id}`);
        await db.collection('payment_logs').add({
          tx_ref,
          flutterwave_id: id,
          status: 'verification_failed',
          payload: data,
          receivedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error('Error verifying transaction:', error);
      await db.collection('errors').add({
        context: 'webhook_verification',
        message: error.message,
        tx_ref,
        id,
        receivedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  // Always respond with a 200 OK to acknowledge receipt of the webhook
  res.status(200).send('Webhook received');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
