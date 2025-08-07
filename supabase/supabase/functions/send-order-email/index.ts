// File: supabase/functions/send-order-email/index.ts
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    const { customer_name, customer_email, order_type, total_amount, deadline } = await req.json()

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL")

    // ✅ Log environment values
    console.log("SENDGRID_API_KEY:", SENDGRID_API_KEY)
    console.log("FROM_EMAIL:", FROM_EMAIL)

    if (!SENDGRID_API_KEY || !FROM_EMAIL) {
      throw new Error("Missing SendGrid API key or FROM_EMAIL in environment variables.")
    }

    const emailContent = {
      personalizations: [
        {
          to: [{ email: customer_email }],
          subject: `Order Confirmation for ${customer_name}`
        }
      ],
      from: { email: FROM_EMAIL },
      content: [
        {
          type: "text/plain",
          value: `Thank you ${customer_name} for placing an order.\n\nOrder Type: ${order_type}\nTotal Amount: ₹${total_amount}\nDeadline: ${deadline}`
        }
      ]
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailContent)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("SendGrid API Error:", errorText)
      return new Response(JSON.stringify({ error: `Failed to send email: ${errorText}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })

  } catch (error) {
    console.error("Edge Function Error:", error.message)
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
  }
})
