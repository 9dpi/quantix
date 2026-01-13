-- Quick populate market_snapshot for testing
INSERT INTO public.market_snapshot (symbol, price, change_24h, high_24h, low_24h, volume, last_candle_data, ai_status, confidence_score, data_quality, last_updated) 
VALUES 
('EURUSD=X', 1.08450, 0.35, 1.08650, 1.08200, 125000000, '[{"o":1.08420,"h":1.08480,"l":1.08400,"c":1.08430,"v":31000000},{"o":1.08430,"h":1.08490,"l":1.08410,"c":1.08440,"v":32000000},{"o":1.08440,"h":1.08500,"l":1.08420,"c":1.08450,"v":33000000},{"o":1.08450,"h":1.08510,"l":1.08430,"c":1.08470,"v":34000000}]'::jsonb, 'BULLISH', 85, 'GOOD', NOW()),
('BTC-USD', 45250.00, 2.15, 45800.00, 44500.00, 28500000000, '[{"o":45100,"h":45300,"l":45050,"c":45150,"v":7000000000},{"o":45150,"h":45350,"l":45100,"c":45200,"v":7100000000},{"o":45200,"h":45400,"l":45150,"c":45250,"v":7200000000},{"o":45250,"h":45450,"l":45200,"c":45300,"v":7300000000}]'::jsonb, 'BULLISH', 82, 'GOOD', NOW()),
('AAPL', 185.50, 1.25, 186.20, 184.80, 52000000, '[{"o":185.20,"h":185.60,"l":185.10,"c":185.30,"v":13000000},{"o":185.30,"h":185.70,"l":185.20,"c":185.40,"v":13100000},{"o":185.40,"h":185.80,"l":185.30,"c":185.50,"v":13200000},{"o":185.50,"h":185.90,"l":185.40,"c":185.60,"v":13300000}]'::jsonb, 'NEUTRAL', 72, 'GOOD', NOW()),
('VN30F1M', 1250.00, 0.85, 1255.00, 1245.00, 15000, '[{"o":1248,"h":1252,"l":1246,"c":1249,"v":3700},{"o":1249,"h":1253,"l":1247,"c":1250,"v":3800},{"o":1250,"h":1254,"l":1248,"c":1251,"v":3900},{"o":1251,"h":1255,"l":1249,"c":1252,"v":4000}]'::jsonb, 'NEUTRAL', 68, 'GOOD', NOW())
ON CONFLICT (symbol) DO UPDATE SET price=EXCLUDED.price, last_candle_data=EXCLUDED.last_candle_data, ai_status=EXCLUDED.ai_status, confidence_score=EXCLUDED.confidence_score, last_updated=NOW();

-- Verify
SELECT symbol, price, ai_status, confidence_score, EXTRACT(EPOCH FROM (NOW() - last_updated)) as age_seconds FROM public.market_snapshot ORDER BY symbol;
