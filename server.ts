import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY not configured in environment. Using fallback response mode.');
    }
    aiClient = new GoogleGenAI({ apiKey: key || '' });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for Paired Robot Devices, Active Secret Keys, Commands & Ingested Telemetry
  let pairedRobots: Array<{
    id: string;
    name: string;
    model: string;
    secretKey: string;
    status: 'ONLINE' | 'STANDBY' | 'OFFLINE' | 'MISSION_ACTIVE';
    lastPing: string;
    ipAddress?: string;
    battery: number;
    signalStrengthDbm: number;
    firmwareVersion: string;
    hardwareType: string;
    assignedSectorId?: string;
    totalPings: number;
  }> = [
    {
      id: 'TT-01',
      name: 'Trash-Trekker-01 (Balurghat Alpha Sweeper)',
      model: 'Autonomous Atrayee Catamaran MK-IV',
      secretKey: 'TT-SEC-9842-A1',
      status: 'ONLINE',
      lastPing: new Date().toISOString(),
      ipAddress: '192.168.1.101',
      battery: 94,
      signalStrengthDbm: -65,
      firmwareVersion: 'v4.3.0-prod',
      hardwareType: 'MARK_IV_SWEEPER',
      assignedSectorId: 'atrayee-balurghat',
      totalPings: 2480,
    },
    {
      id: 'TT-02',
      name: 'Trash-Trekker-02 (Subhash Setu Bio-Skimmer)',
      model: 'Solar High-Speed Bio-Skimmer MK-IV',
      secretKey: 'TT-SEC-4180-B2',
      status: 'ONLINE',
      lastPing: new Date().toISOString(),
      ipAddress: '192.168.1.102',
      battery: 89,
      signalStrengthDbm: -68,
      firmwareVersion: 'v4.3.0-prod',
      hardwareType: 'MARK_IV_SWEEPER',
      assignedSectorId: 'atrayee-balurghat',
      totalPings: 1840,
    },
    {
      id: 'TT-03',
      name: 'Trash-Trekker-03 (Chakbhabani Debris Interceptor)',
      model: 'Deep Water Chemical Sentinel MK-IV',
      secretKey: 'TT-SEC-7291-C3',
      status: 'ONLINE',
      lastPing: new Date().toISOString(),
      ipAddress: '192.168.1.103',
      battery: 92,
      signalStrengthDbm: -62,
      firmwareVersion: 'v4.3.0-prod',
      hardwareType: 'MARK_IV_SWEEPER',
      assignedSectorId: 'atrayee-balurghat',
      totalPings: 3120,
    },
    {
      id: 'TT-04',
      name: 'Trash-Trekker-04 (Samjhia-Patiram Plume Analyzer)',
      model: 'Microplastic Vortex Skimmer MK-IV',
      secretKey: 'TT-SEC-8419-D4',
      status: 'ONLINE',
      lastPing: new Date().toISOString(),
      ipAddress: '192.168.1.104',
      battery: 85,
      signalStrengthDbm: -71,
      firmwareVersion: 'v4.3.0-prod',
      hardwareType: 'MARK_IV_SWEEPER',
      assignedSectorId: 'atrayee-balurghat',
      totalPings: 1540,
    },
    {
      id: 'TT-05',
      name: 'Trash-Trekker-05 (Khidirpur Reach Sweeper)',
      model: 'Heavy Payload EcoCatamaran MK-IV',
      secretKey: 'TT-SEC-5520-E5',
      status: 'ONLINE',
      lastPing: new Date().toISOString(),
      ipAddress: '192.168.1.105',
      battery: 97,
      signalStrengthDbm: -59,
      firmwareVersion: 'v4.3.0-prod',
      hardwareType: 'MARK_IV_SWEEPER',
      assignedSectorId: 'atrayee-balurghat',
      totalPings: 1980,
    }
  ];

  let pendingCommands: Array<{
    id: string;
    robotId: string;
    commandType: string;
    params?: any;
    issuedAt: string;
    status: 'PENDING' | 'EXECUTED' | 'FAILED';
  }> = [];

  let liveHardwareTelemetryHistory: any[] = [];
  let latestHardwarePoint: any = null;

  // --- 1. Robot Device Management & Secret Codes API ---

  // List paired devices
  app.get('/api/robot/devices', (req, res) => {
    res.json({
      success: true,
      count: pairedRobots.length,
      devices: pairedRobots,
    });
  });

  // Generate a new secure secret pairing code
  app.post('/api/robot/generate-key', (req, res) => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newSecretKey = `TT-SEC-${randomNum}-${randomHex}`;
    res.json({
      success: true,
      secretKey: newSecretKey,
      generatedAt: new Date().toISOString(),
      instructions: 'Provide this secret code in your robot HTTP POST header "X-Robot-Secret" or body "secretKey".'
    });
  });

  // Pair a new robot device using a secret code
  app.post('/api/robot/pair', (req, res) => {
    const { id, name, model, secretKey, hardwareType, assignedSectorId, ipAddress } = req.body;

    if (!id || !secretKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: id and secretKey are mandatory.',
      });
    }

    const cleanId = String(id).trim().toUpperCase();
    const existingIndex = pairedRobots.findIndex(r => r.id === cleanId);

    const newDevice = {
      id: cleanId,
      name: name || `Robot ${cleanId}`,
      model: model || 'Generic Autonomous Vessel',
      secretKey: String(secretKey).trim(),
      status: 'ONLINE' as const,
      lastPing: new Date().toISOString(),
      ipAddress: ipAddress || req.ip || '127.0.0.1',
      battery: 100,
      signalStrengthDbm: -65,
      firmwareVersion: 'v1.0.0-custom',
      hardwareType: hardwareType || 'CUSTOM_API',
      assignedSectorId: assignedSectorId || 'ganges-varanasi',
      totalPings: 1,
    };

    if (existingIndex >= 0) {
      pairedRobots[existingIndex] = {
        ...pairedRobots[existingIndex],
        ...newDevice,
      };
    } else {
      pairedRobots.push(newDevice);
    }

    res.json({
      success: true,
      message: `Robot ${cleanId} paired successfully!`,
      device: newDevice,
    });
  });

  // Unpair / remove a robot device
  app.delete('/api/robot/devices/:id', (req, res) => {
    const deviceId = req.params.id.toUpperCase();
    const initialLen = pairedRobots.length;
    pairedRobots = pairedRobots.filter(r => r.id !== deviceId);

    if (pairedRobots.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Device not found.' });
    }

    res.json({
      success: true,
      message: `Device ${deviceId} has been disconnected and revoked.`,
    });
  });

  // --- 2. Ingest Live Telemetry from Physical / Simulated Robots ---
  // Microcontrollers (ESP32, Raspberry Pi, Arduino, ROS2, Python scripts) can POST here.
  app.post('/api/robot/telemetry', (req, res) => {
    const authHeader = req.headers['x-robot-secret'] || req.headers['authorization'];
    const secretKey = (typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null) || req.body.secretKey;
    const robotId = (req.body.robotId || req.body.id || 'BOT-TT-09').toString().toUpperCase();

    // Check if robot is registered and secret code matches
    const robot = pairedRobots.find(r => r.id === robotId);

    if (!robot) {
      // Auto-register if a secret key is supplied, or reject if unauthorized
      if (!secretKey) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Missing secret code. Please provide secretKey or header X-Robot-Secret.',
        });
      }
    } else if (robot.secretKey && robot.secretKey !== secretKey) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Invalid secret code for this robot device.',
      });
    }

    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Parse incoming hydrochemical and spatial sensor payload
    const bodVal = Number(req.body.bodLevel ?? req.body.bod ?? 2.4);
    const h2sVal = Number(req.body.h2sLevel ?? req.body.h2s ?? 0.008);
    const methaneVal = Number(req.body.methaneLevel ?? req.body.methane ?? 0.45);
    const phosphateVal = Number(req.body.phosphateLevel ?? req.body.phosphate ?? 0.09);

    const isCritical = (
      req.body.ph < 6.0 || req.body.ph > 9.0 ||
      req.body.turbidity > 40 ||
      bodVal >= 5.0 ||
      h2sVal >= 0.08 ||
      methaneVal >= 2.0 ||
      phosphateVal >= 0.25
    );

    const isWarning = (
      req.body.ph < 6.5 || req.body.ph > 8.2 ||
      req.body.turbidity > 25 ||
      bodVal >= 3.5 ||
      h2sVal >= 0.02 ||
      methaneVal >= 1.0 ||
      phosphateVal >= 0.15
    );

    const telemetryEntry = {
      id: `hw-${Date.now()}`,
      robotId,
      timestamp: timestampStr,
      timeNumber: now.getTime(),
      lat: Number(req.body.lat ?? req.body.latitude ?? 25.3176),
      lng: Number(req.body.lng ?? req.body.longitude ?? 83.0062),
      ph: Number(req.body.ph ?? 7.35),
      temperature: Number(req.body.temperature ?? req.body.temp ?? 24.5),
      turbidity: Number(req.body.turbidity ?? 5.2),
      dissolvedOxygen: Number(req.body.dissolvedOxygen ?? req.body.do ?? 7.4),
      bodLevel: bodVal,
      h2sLevel: h2sVal,
      methaneLevel: methaneVal,
      phosphateLevel: phosphateVal,
      trashCollectedKg: Number(req.body.trashCollectedKg ?? req.body.trashKg ?? 0),
      instantTrashAddedKg: Number(req.body.instantTrashAddedKg ?? 0),
      battery: Math.min(100, Math.max(0, Number(req.body.battery ?? req.body.batteryLevel ?? 95))),
      speedKnots: Number(req.body.speedKnots ?? req.body.speed ?? 3.4),
      heading: Number(req.body.heading ?? 180),
      solarWatts: Number(req.body.solarWatts ?? 140),
      aqi: Number(req.body.aqi ?? 85),
      humidity: Number(req.body.humidity ?? 62),
      flowRate: Number(req.body.flowRate ?? 4.2),
      signalDbm: Number(req.body.signalStrengthDbm ?? req.body.signalDbm ?? -68),
      isSpike: Boolean(req.body.ph < 6.5 || req.body.ph > 8.5 || req.body.turbidity > 30 || bodVal > 4.0 || h2sVal > 0.05 || methaneVal > 1.5),
      status: isCritical ? 'critical' : isWarning ? 'warning' : 'safe',
      receivedVia: 'ROBOT_REST_API',
    };

    latestHardwarePoint = telemetryEntry;
    liveHardwareTelemetryHistory.push(telemetryEntry);
    if (liveHardwareTelemetryHistory.length > 50) {
      liveHardwareTelemetryHistory.shift();
    }

    // Update robot status
    if (robot) {
      robot.lastPing = now.toISOString();
      robot.status = 'ONLINE';
      robot.battery = telemetryEntry.battery;
      robot.signalStrengthDbm = telemetryEntry.signalDbm;
      robot.totalPings += 1;
      robot.ipAddress = req.ip || robot.ipAddress;
    }

    // Check if there are pending commands for this robot
    const robotCommands = pendingCommands.filter(c => c.robotId === robotId && c.status === 'PENDING');
    robotCommands.forEach(c => { c.status = 'EXECUTED'; });

    res.json({
      success: true,
      message: 'Telemetry ingested successfully.',
      timestamp: now.toISOString(),
      pendingCommands: robotCommands,
      point: telemetryEntry,
    });
  });

  // Get live ingested hardware telemetry
  app.get('/api/robot/telemetry/live', (req, res) => {
    res.json({
      success: true,
      latestPoint: latestHardwarePoint,
      history: liveHardwareTelemetryHistory,
      pairedRobots,
      activeRobotsCount: pairedRobots.filter(r => r.status === 'ONLINE').length,
    });
  });

  // --- 3. Remote Robot Command Center ---
  app.post('/api/robot/command', (req, res) => {
    const { robotId, commandType, params } = req.body;
    if (!robotId || !commandType) {
      return res.status(400).json({ success: false, error: 'robotId and commandType are required.' });
    }

    const cmd = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      robotId: robotId.toUpperCase(),
      commandType,
      params: params || {},
      issuedAt: new Date().toISOString(),
      status: 'PENDING' as const,
    };

    pendingCommands.push(cmd);
    res.json({
      success: true,
      message: `Command "${commandType}" queued for robot ${robotId}.`,
      command: cmd,
    });
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      pairedRobotsCount: pairedRobots.length,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Gemini Multi-Turn Chat with Google Search & Maps Grounding
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        messages,
        model = 'gemini-2.5-flash',
        useSearch = true,
        useMaps = true,
        telemetryContext,
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          reply: `**[System Advisory: Offline Simulation Mode]**\n\nI received your query regarding river health and environmental management. To enable real-time Gemini AI with live Google Search & Maps grounding, add your \`GEMINI_API_KEY\` in Settings.\n\n**Current Sector Telemetry Snapshot:**\n- **pH Level:** ${telemetryContext?.ph || '7.65'}\n- **Turbidity:** ${telemetryContext?.turbidity || '12.8'} NTU\n- **Dissolved Oxygen:** ${telemetryContext?.dissolvedOxygen || '7.8'} mg/L\n- **Trash Collected:** ${telemetryContext?.trashCollectedKg || '28.4'} kg\n- **Active Location:** ${telemetryContext?.sectorName || 'Atrayee River - Balurghat Heritage Corridor'}`,
          sources: [
            { title: 'West Bengal Pollution Control Board (WBPCB)', url: 'https://wbpcb.gov.in', type: 'web' },
            { title: 'Central Pollution Control Board (CPCB) Guidelines', url: 'https://cpcb.nic.in', type: 'web' }
          ],
        });
      }

      const ai = getAI();

      // Configure tools dynamically based on user selection
      const tools: any[] = [];
      if (useSearch) {
        tools.push({ googleSearch: {} });
      }
      if (useMaps) {
        // googleMaps tool for live geographical and places data
        tools.push({ googleMaps: {} });
      }

      const systemInstruction = `You are "AeroHydro Copilot", an elite Marine Autonomous Environmental Telemetry AI and River Basin Specialist operating alongside the Mark IV Trash-Trekker autonomous sweeper drone.
You provide deep, accurate, hydrochemical, ecological, geographic, and pollution abatement insights for river basins worldwide, focusing on the Atrayee River (Balurghat, Patiram, Samjhia, Kumarganj), West Bengal, India.

Current Live Telemetry & Mission State Context:
- Active River Sector: ${telemetryContext?.sectorName || 'Atrayee River - Balurghat Heritage & Urban Riverfront Corridor'}
- Drone Coordinates: Lat ${telemetryContext?.lat || 25.2225}, Lng ${telemetryContext?.lng || 88.7650}
- Sensor Readings: pH ${telemetryContext?.ph || 7.68} (${telemetryContext?.status || 'safe'}), Turbidity ${telemetryContext?.turbidity || 12.8} NTU, DO ${telemetryContext?.dissolvedOxygen || 7.8} mg/L, Temp ${telemetryContext?.temperature || 25.2}°C
- Accumulated Trash Cleared: ${telemetryContext?.trashCollectedKg || 28.4} kg
- Active Emergency Alerts: ${telemetryContext?.activeAlertsCount || 0}

Guidelines:
1. Ground your answers using real Google Search and Google Maps data whenever locations, environmental regulations, weather, industrial outfalls, or nearby sewage treatment plants are discussed.
2. Structure your replies clearly using concise Markdown formatting with bullet points and bold highlights.
3. Recommend actionable drone navigation maneuvers, water sampling strategies, or WBPCB/CPCB regulatory reporting protocols when high acidity, ammonia spikes, or plastic debris aggregations are flagged.`;

      // Convert conversation messages to Gemini format
      const formattedContents = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // If no messages sent, add placeholder
      if (!formattedContents.length) {
        formattedContents.push({
          role: 'user',
          parts: [{ text: 'Provide a brief river water quality summary.' }],
        });
      }

      const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: tools.length ? tools : undefined,
          temperature: 0.3,
        },
      });

      const replyText = response.text || 'I analyzed the sensor data and river coordinates. Everything appears within normal operating parameters.';

      // Extract grounding metadata if available
      const sources: any[] = [];
      const candidates = (response as any).candidates;
      if (candidates && candidates[0]?.groundingMetadata) {
        const gm = candidates[0].groundingMetadata;
        if (gm.groundingChunks) {
          for (const chunk of gm.groundingChunks) {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || chunk.web.uri,
                url: chunk.web.uri,
                type: 'search',
              });
            } else if (chunk.maps?.source || chunk.maps?.placeName) {
              sources.push({
                title: chunk.maps.placeName || 'Google Maps Location Reference',
                url: chunk.maps.placeUri || `https://maps.google.com/?q=${encodeURIComponent(chunk.maps.placeName || '')}`,
                type: 'maps',
              });
            }
          }
        }
        if (gm.webSearchQueries) {
          // Add search queries used
        }
      }

      res.json({
        reply: replyText,
        sources,
      });
    } catch (error: any) {
      console.error('Error generating content with Gemini:', error);
      res.status(500).json({
        error: error.message || 'Failed to process AI query',
        reply: `⚠️ **AI Copilot Encountered an Error:** ${error.message || 'Check server configuration or API quota.'}`,
        sources: [],
      });
    }
  });

  // 3. Vite development or production static asset server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrashTrekker Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
