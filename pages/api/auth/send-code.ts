// In-memory storage for verification codes (for demo purposes)
// In production, use Redis or a proper database
export const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Generate a 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Store the code
  verificationCodes.set(phoneNumber, { code, expiresAt });

  // In a real app, you would send the code via SMS
  console.log(`Verification code for ${phoneNumber}: ${code}`);

  res.status(200).json({ 
    message: 'Verification code sent',
    // For demo purposes, include the code in the response
    // Remove this in production!
    code: process.env.NODE_ENV === 'development' ? code : undefined
  });
}