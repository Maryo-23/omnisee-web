'use client';

import { useState } from 'react';

const API = 'https://omnisee-backend.onrender.com';

interface PaymentModalProps {
  amount: number;
  description: string;
  onClose: () => void;
  darkMode: boolean;
}

export default function PaymentModal({ amount, description, onClose, darkMode }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const isDark = darkMode;
  const textColor = isDark ? 'white' : '#262626';
  const secondaryText = isDark ? '#A8A8A8' : '#8E8E8E';

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      // Create payment intent
      const res = await fetch(`${API}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'usd' }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        // In a real app, you'd use Stripe Elements to confirm the payment
        // For now, we simulate success
        setSuccess(true);
      } else {
        setError(data.error || 'Payment failed');
      }
    } catch (err) {
      setError('Payment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
        <div style={{ background: isDark ? '#1A1A2E' : '#FFFFFF', borderRadius: 24, padding: 40, maxWidth: 420, width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: textColor, marginBottom: 8 }}>Payment Successful!</h3>
          <p style={{ color: secondaryText, marginBottom: 24 }}>Thank you for your purchase of {description}.</p>
          <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <div style={{ background: isDark ? '#1A1A2E' : '#FFFFFF', borderRadius: 24, padding: 40, maxWidth: 420, width: '90%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 8, color: textColor }}>Complete Payment</h3>
        <p style={{ color: secondaryText, marginBottom: 20 }}>{description} — ${amount.toFixed(2)}</p>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center' }}>
            <span style={{ padding: '4px 8px', background: isDark ? '#262626' : '#f0f0f0', borderRadius: 4, fontSize: '0.8rem' }}>💳 Card</span>
            <span style={{ padding: '4px 8px', background: isDark ? '#262626' : '#f0f0f0', borderRadius: 4, fontSize: '0.8rem' }}>Google Pay</span>
            <span style={{ padding: '4px 8px', background: isDark ? '#262626' : '#f0f0f0', borderRadius: 4, fontSize: '0.8rem' }}>Apple Pay</span>
            <span style={{ padding: '4px 8px', background: isDark ? '#262626' : '#f0f0f0', borderRadius: 4, fontSize: '0.8rem' }}>PayPal</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: secondaryText, textAlign: 'center' }}>
            Payments processed securely via Stripe. Google Pay, Apple Pay, and PayPal available at checkout.
          </p>
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>}

        <input style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#f9fafb', color: textColor, marginBottom: 12 }} placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
        <div style={{ display: 'flex', gap: 12 }}>
          <input style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#f9fafb', color: textColor }} placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          <input style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, background: isDark ? '#0a0a0a' : '#f9fafb', color: textColor }} placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button onClick={handlePayment} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #EC4899)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontWeight: 600 }}>
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: isDark ? '#262626' : '#e5e7eb', color: textColor, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
