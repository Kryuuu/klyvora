import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import midtransClient from 'midtrans-client'

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Midtrans Snap in PRODUCTION MODE
    const snap = new midtransClient.Snap({
      isProduction: true,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    // Upsert default subscription record sebelum payment (mencegah duplikat)
    await supabase.from('subscriptions').upsert([{
        user_id: user.id,
        plan: 'free',
        status: 'inactive'
    }], { onConflict: 'user_id', ignoreDuplicates: true })

    // Buat order_id yang aman (MAX 50 karakter Midtrans)
    // UUID = 36 char + dash + 8 char base36 timestamp = 45 char total
    const orderId = `${user.id}-${Date.now().toString(36).toUpperCase()}`

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 49000
      },
      customer_details: {
        email: user.email,
        first_name: user.email.split('@')[0],
        last_name: 'KlyVora User'
      },
      item_details: [
        {
           id: 'PRO-KLYVORA-001',
           price: 49000,
           quantity: 1,
           name: 'KlyVora PRO - Unlimited AI Workflows'
        }
      ],
      // CRITICAL: Simpan user metadata agar webhook bisa mengidentifikasi siapa yg bayar
      custom_field1: user.id,
      custom_field2: user.email
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({
        token: transaction.token,
        redirect_url: transaction.redirect_url
    }, { status: 200 })

  } catch (error) {
    console.error('[Payment API Error]:', error?.message)
    return NextResponse.json({ error: error.message || 'Failed to create payment transaction' }, { status: 500 })
  }
}
