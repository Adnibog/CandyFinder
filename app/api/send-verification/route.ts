import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, code, name } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Check if we're in demo mode (no API key configured)
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 DEMO MODE - Email would be sent to:', email)
      console.log('🔐 Verification Code:', code)
      return NextResponse.json({ 
        success: true, 
        demo: true,
        message: 'Check console for verification code (demo mode)' 
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'CandyFinder <noreply@candyfinder.app>',
      to: [email],
      subject: '🍬 Your CandyFinder Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #1a0b2e 0%, #2d1b3d 100%);
                padding: 40px 20px;
                margin: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
              }
              .header {
                background: linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%);
                padding: 40px 20px;
                text-align: center;
              }
              .logo {
                font-size: 48px;
                margin-bottom: 10px;
              }
              .title {
                color: white;
                font-size: 28px;
                font-weight: bold;
                margin: 0;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
              }
              .code-container {
                background: #f8f9fa;
                border: 2px dashed #FF6B35;
                border-radius: 12px;
                padding: 30px;
                margin: 30px 0;
              }
              .code {
                font-size: 42px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #FF6B35;
                font-family: 'Courier New', monospace;
              }
              .instructions {
                color: #666;
                line-height: 1.6;
                margin: 20px 0;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #999;
                font-size: 14px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🍬</div>
                <h1 class="title">CandyFinder</h1>
              </div>
              <div class="content">
                <p class="greeting">Hi ${name || 'there'}! 👋</p>
                <p class="instructions">
                  Thanks for joining CandyFinder! To complete your registration, please verify your email address with the code below:
                </p>
                <div class="code-container">
                  <div class="code">${code}</div>
                </div>
                <p class="instructions">
                  Enter this 6-digit code in the verification modal to activate your account.
                </p>
                <div class="warning">
                  <strong>⚠️ Security Note:</strong> This code will expire in 15 minutes. If you didn't request this code, please ignore this email.
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} CandyFinder. All rights reserved.</p>
                <p>Happy trick-or-treating! 🎃</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in send-verification:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
