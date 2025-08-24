export default function handler(req: any, res: any) {
  res.status(200).json({ 
    message: 'FUTBot API running',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
