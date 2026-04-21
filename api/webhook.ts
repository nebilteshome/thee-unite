import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

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
 * Flutterwave will send a POST request to this URL when a payment event occurs.
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
        
        // TODO: Update your database (e.g., Firestore) to mark order as paid
        // Example:
        // await db.collection('orders').doc(tx_ref).update({ status: 'paid', flutterwaveId: id });
        
      } else {
        console.warn(`[FAILED] Transaction verification failed for ID: ${id}`);
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
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
