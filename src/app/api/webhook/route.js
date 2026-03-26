import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1, // user_id  — dikirim saat payment dibuat
      custom_field2  // email    — dikirim saat payment dibuat
    } = body

    console.log(`[Webhook] Received: order_id=${order_id}, status=${transaction_status}`)

    const serverKey = process.env.MIDTRANS_SERVER_KEY

    // === SECURITY: Verifikasi Tanda-tangan Midtrans (SHA-512) ===
    const hash = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex')

    if (hash !== signature_key) {
      console.warn(`[Webhook] INVALID SIGNATURE for order ${order_id}`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // === Init Supabase Admin (SERVICE ROLE — tidak pernah ke frontend) ===
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // === Identifikasi User via custom_field1 (langsung dari metadata payment) ===
    // Jika custom_field1 tidak tersedia, fallback ke parsing order_id (UUID 5 blok pertama)
    const userId = custom_field1 || order_id.split('-').slice(0, 5).join('-')

    if (!userId) {
      console.error(`[Webhook] Cannot identify user from order: ${order_id}`)
      return NextResponse.json({ error: 'User identification failed' }, { status: 400 })
    }

    // === Proses Berdasarkan Status Transaksi ===
    if (transaction_status === 'settlement' || 
        (transaction_status === 'capture' && fraud_status === 'accept')) {
      
      // PEMBAYARAN SUKSES → Upgrade ke PRO
      const { error: upsertError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: 'pro',
          status: 'active'
        }, { onConflict: 'user_id' })

      if (upsertError) {
        console.error(`[Webhook] DB upsert failed for user ${userId}:`, upsertError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log(`[Webhook] ✓ User ${userId} (${custom_field2}) upgraded to PRO`)

    } else if (transaction_status === 'pending') {
      // Pembayaran menunggu konfirmasi — set status pending
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: 'free',
          status: 'inactive'
        }, { onConflict: 'user_id' })

      console.log(`[Webhook] ⏳ Payment pending for user ${userId}`)

    } else if (['cancel', 'deny', 'expire', 'failure'].includes(transaction_status)) {
      // Pembayaran gagal/dibatalkan
      console.log(`[Webhook] ✗ Payment ${transaction_status} for order ${order_id}`)
      // Biarkan tetap free, tidak perlu update DB
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 })

  } catch (error) {
    console.error('[Webhook Error]:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
