export default function handler(req: any, res: any) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: 'ChopChop',
    version: '1.0.0'
  })
}
