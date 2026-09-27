import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Biohazard,
  Compass,
  Droplets,
  Flame,
  FlaskConical,
  Gauge,
  Layers,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Thermometer,
  Waves,
  Wind
} from 'lucide-react';
import { TelemetryPoint } from '../types';
import { MetricCard } from './MetricCard';

interface SensorGridProps {
  currentPoint: TelemetryPoint;
  previousPoint?: TelemetryPoint;
}

export const SensorGrid: React.FC<SensorGridProps> = ({
  currentPoint,
  previousPoint,
}) => {
  const [viewFilter, setViewFilter] = useState<'all' | 'primary' | 'biochemical'>('all');

  // --- 1. PRIMARY HYDROCHEMICAL METRICS ---

  // 1. pH Safety analysis
  const ph = currentPoint.ph;
  let phStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let phStatusText = 'OPTIMAL';
  let phSubtitle = 'Normal aquatic balance';

  if (ph < 6.0) {
    phStatus = 'critical';
    phStatusText = 'CRITICAL ACIDIC';
    phSubtitle = 'Severe chemical outfall detected';
  } else if (ph < 6.5) {
    phStatus = 'warning';
    phStatusText = 'MODERATELY ACIDIC';
    phSubtitle = 'Sub-optimal aquatic runoff';
  } else if (ph > 8.5) {
    phStatus = 'critical';
    phStatusText = 'CRITICAL ALKALINE';
    phSubtitle = 'High caustic alkalinity';
  } else if (ph > 8.2) {
    phStatus = 'warning';
    phStatusText = 'MILDLY ALKALINE';
    phSubtitle = 'Approaching upper safety limit';
  }

  // 2. Temperature Safety analysis (18°C - 28°C safe)
  const temp = currentPoint.temperature;
  let tempStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let tempStatusText = 'NORMAL';
  if (temp < 15 || temp > 30) {
    tempStatus = 'critical';
    tempStatusText = 'THERMAL SHOCK';
  } else if (temp < 18 || temp > 28) {
    tempStatus = 'warning';
    tempStatusText = 'ELEVATED TEMP';
  }
  const tempFahrenheit = ((temp * 9) / 5 + 32).toFixed(1);

  // 3. Humidity Safety analysis (60% - 90% normal outdoor river basin)
  const hum = currentPoint.humidity;
  let humStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let humStatusText = 'BALANCED';
  if (hum < 40 || hum > 95) {
    humStatus = 'warning';
    humStatusText = 'EXTREME';
  }

  // 4. Water Quality Index (AQI / WQI)
  const aqi = currentPoint.aqi;
  let aqiStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let aqiStatusText = 'EXCELLENT';
  if (aqi < 40) {
    aqiStatus = 'critical';
    aqiStatusText = 'HAZARDOUS';
  } else if (aqi < 70) {
    aqiStatus = 'warning';
    aqiStatusText = 'MODERATE';
  }

  // --- 2. BIOCHEMICAL & GAS TOXICITY METRICS (NEW PARAMETERS) ---

  // 5. BOD Level (Biochemical Oxygen Demand) - Clean standard: 1.0 - 3.5 mg/L
  const bod = currentPoint.bodLevel ?? 2.45;
  let bodStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let bodStatusText = 'OPTIMAL';
  let bodSubtitle = 'Low organic degradation';

  if (bod >= 8.0) {
    bodStatus = 'critical';
    bodStatusText = 'SEWAGE SPIKE';
    bodSubtitle = 'Severe organic overload (hypoxia risk)';
  } else if (bod >= 4.0) {
    bodStatus = 'warning';
    bodStatusText = 'ELEVATED';
    bodSubtitle = 'Moderate organic matter present';
  }

  // 6. H2S Level (Hydrogen Sulfide) - Toxicity Threshold: safe < 0.02 ppm, critical >= 0.08 ppm
  const h2s = currentPoint.h2sLevel ?? 0.008;
  let h2sStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let h2sStatusText = 'SAFE TRACE';
  let h2sSubtitle = 'Non-toxic benthic levels';

  if (h2s >= 0.08) {
    h2sStatus = 'critical';
    h2sStatusText = 'TOXIC HAZARD';
    h2sSubtitle = 'Lethal sulfide gas concentration';
  } else if (h2s >= 0.02) {
    h2sStatus = 'warning';
    h2sStatusText = 'MODERATE';
    h2sSubtitle = 'Anaerobic sediment outgassing';
  }

  // 7. Methane Level (CH4) - LEL Safety Threshold: safe < 1.0 % LEL, critical >= 3.0 % LEL
  const methane = currentPoint.methaneLevel ?? 0.45;
  let methaneStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let methaneStatusText = 'SAFE TRACE';
  let methaneSubtitle = 'Normal biogenic dispersion';

  if (methane >= 3.0) {
    methaneStatus = 'critical';
    methaneStatusText = 'PLUME RISK';
    methaneSubtitle = 'High flammability / emission spike';
  } else if (methane >= 1.0) {
    methaneStatus = 'warning';
    methaneStatusText = 'ELEVATED';
    methaneSubtitle = 'Decomposition gas accumulation';
  }

  // 8. Phosphate Level (PO4^3-) - Eutrophication Threshold: safe < 0.15 mg/L, critical >= 0.40 mg/L
  const phosphate = currentPoint.phosphateLevel ?? 0.09;
  let phosphateStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let phosphateStatusText = 'OPTIMAL';
  let phosphateSubtitle = 'Balanced nutrient ecosystem';

  if (phosphate >= 0.40) {
    phosphateStatus = 'critical';
    phosphateStatusText = 'ALGAL THREAT';
    phosphateSubtitle = 'Severe fertilizer/sewage runoff';
  } else if (phosphate >= 0.15) {
    phosphateStatus = 'warning';
    phosphateStatusText = 'EUTROPHIC';
    phosphateSubtitle = 'Elevated phosphorus loading';
  }

  // Delta calculations
  const phDelta = previousPoint ? (ph - previousPoint.ph).toFixed(2) : '0.00';
  const tempDelta = previousPoint ? (temp - previousPoint.temperature).toFixed(1) : '0.0';
  const bodDelta = previousPoint && previousPoint.bodLevel ? (bod - previousPoint.bodLevel).toFixed(2) : '0.00';
  const h2sDelta = previousPoint && previousPoint.h2sLevel ? (h2s - previousPoint.h2sLevel).toFixed(3) : '0.000';
  const methaneDelta = previousPoint && previousPoint.methaneLevel ? (methane - previousPoint.methaneLevel).toFixed(2) : '0.00';
  const phosphateDelta = previousPoint && previousPoint.phosphateLevel ? (phosphate - previousPoint.phosphateLevel).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      
      {/* Sensor Section Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
              Live River Hydrochemical & Gas Telemetry Matrix
            </h2>
            <p className="text-[11px] text-slate-400">
              8 Real-Time Autonomous Sweeper Sensors & Toxicity Monitoring
            </p>
          </div>
        </div>

        {/* View Filter Pills */}
        <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] uppercase tracking-wider transition-all ${
              viewFilter === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 8 Sensors
          </button>
          <button
            onClick={() => setViewFilter('primary')}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] uppercase tracking-wider transition-all ${
              viewFilter === 'primary'
                ? 'bg-slate-800 text-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Physical (4)
          </button>
          <button
            onClick={() => setViewFilter('biochemical')}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] uppercase tracking-wider transition-all ${
              viewFilter === 'biochemical'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Biochemical & Gas (4)
          </button>
        </div>
      </div>

      {/* Row 1: Primary Hydrochemical & Physical Sensors */}
      {(viewFilter === 'all' || viewFilter === 'primary') && (
        <div className="space-y-1.5">
          {viewFilter === 'all' && (
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Category I: Physical & Environmental Baseline</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Metric 1: pH Level */}
            <MetricCard
              id="metric-ph"
              title="Water pH Level"
              value={ph.toFixed(2)}
              unit="pH"
              secondaryValue={`Δ ${Number(phDelta) > 0 ? '+' : ''}${phDelta}`}
              icon={ph < 6.0 || ph > 8.5 ? ShieldAlert : Droplets}
              status={phStatus}
              statusText={phStatusText}
              thresholdText="Acceptable: 6.5 – 8.5 pH"
              minRange={4.0}
              maxRange={10.0}
              currentNumber={ph}
              safeMin={6.5}
              safeMax={8.5}
              isCriticalAlert={ph < 6.0 || ph > 8.5}
              colorTheme="cyan"
              subDetails={[
                { label: 'Condition', value: phSubtitle },
                { label: 'Standard Probe', value: 'Glass ISE #P1-04' },
              ]}
            />

            {/* Metric 2: Temperature */}
            <MetricCard
              id="metric-temp"
              title="Temperature"
              value={temp.toFixed(1)}
              unit="°C"
              secondaryValue={`${tempFahrenheit}°F`}
              icon={Thermometer}
              status={tempStatus}
              statusText={tempStatusText}
              thresholdText="Normal River Range: 18 – 28°C"
              minRange={10.0}
              maxRange={35.0}
              currentNumber={temp}
              safeMin={18.0}
              safeMax={28.0}
              colorTheme="amber"
              subDetails={[
                { label: 'Thermal Delta', value: `${Number(tempDelta) >= 0 ? '+' : ''}${tempDelta}°C / min` },
                { label: 'Submersion Depth', value: '0.45 m (intake)' },
              ]}
            />

            {/* Metric 3: Ambient Humidity */}
            <MetricCard
              id="metric-humidity"
              title="Ambient Humidity"
              value={hum}
              unit="%"
              secondaryValue={`Dew Pt: ${(temp - (100 - hum) / 5).toFixed(1)}°C`}
              icon={Wind}
              status={humStatus}
              statusText={humStatusText}
              thresholdText="Basin Range: 60 – 90%"
              minRange={20}
              maxRange={100}
              currentNumber={hum}
              safeMin={60}
              safeMax={90}
              colorTheme="sky"
              subDetails={[
                { label: 'Barometer', value: '1013.2 hPa' },
                { label: 'Air Temp', value: `${(temp + 1.2).toFixed(1)}°C` },
              ]}
            />

            {/* Metric 4: Water Quality Index (AQI / WQI) */}
            <MetricCard
              id="metric-aqi"
              title="Water Quality Index"
              value={aqi}
              unit="/100"
              secondaryValue={aqiStatusText}
              icon={aqi >= 70 ? ShieldCheck : ShieldAlert}
              status={aqiStatus}
              statusText={aqiStatusText}
              thresholdText="Clean Baseline: > 70 Score"
              minRange={0}
              maxRange={100}
              currentNumber={aqi}
              safeMin={70}
              safeMax={100}
              isCriticalAlert={aqi < 40}
              colorTheme="emerald"
              subDetails={[
                { label: 'Turbidity', value: `${currentPoint.turbidity} NTU` },
                { label: 'Dissolved O₂', value: `${currentPoint.dissolvedOxygen} mg/L` },
              ]}
            />

          </div>
        </div>
      )}

      {/* Row 2: Biochemical Toxicity & Nutrient Matrix (4 New Parameters) */}
      {(viewFilter === 'all' || viewFilter === 'biochemical') && (
        <div className="space-y-1.5 pt-1">
          {viewFilter === 'all' && (
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span>Category II: Biochemical Toxicity & Nutrient Matrix</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Metric 5: BOD Level (Biochemical Oxygen Demand) */}
            <MetricCard
              id="metric-bod"
              title="BOD Level (Organic Load)"
              value={bod.toFixed(2)}
              unit="mg/L"
              secondaryValue={`Δ ${Number(bodDelta) > 0 ? '+' : ''}${bodDelta}`}
              icon={bod >= 8.0 ? Biohazard : FlaskConical}
              status={bodStatus}
              statusText={bodStatusText}
              thresholdText="Clean River: < 3.5 mg/L"
              minRange={0.0}
              maxRange={15.0}
              currentNumber={bod}
              safeMin={0.0}
              safeMax={3.5}
              isCriticalAlert={bod >= 8.0}
              colorTheme="purple"
              subDetails={[
                { label: 'Organic Load', value: bodSubtitle },
                { label: 'BOD₅ Assay', value: 'EPA Method 405.1' },
              ]}
            />

            {/* Metric 6: H2S Level (Hydrogen Sulfide Toxicity) */}
            <MetricCard
              id="metric-h2s"
              title="H₂S Level (Toxicity)"
              value={h2s.toFixed(3)}
              unit="ppm"
              secondaryValue={`Δ ${Number(h2sDelta) > 0 ? '+' : ''}${h2sDelta}`}
              icon={h2s >= 0.08 ? ShieldAlert : AlertTriangle}
              status={h2sStatus}
              statusText={h2sStatusText}
              thresholdText="Toxicity Cap: < 0.02 ppm"
              minRange={0.000}
              maxRange={0.200}
              currentNumber={h2s}
              safeMin={0.000}
              safeMax={0.020}
              isCriticalAlert={h2s >= 0.08}
              colorTheme="rose"
              subDetails={[
                { label: 'Safety Index', value: h2sSubtitle },
                { label: 'Sensor Optic', value: 'Photoionization Probe' },
              ]}
            />

            {/* Metric 7: Methane Level (CH4 Gas Concentration) */}
            <MetricCard
              id="metric-methane"
              title="Methane Level (CH₄)"
              value={methane.toFixed(2)}
              unit="% LEL"
              secondaryValue={`Δ ${Number(methaneDelta) > 0 ? '+' : ''}${methaneDelta}`}
              icon={Flame}
              status={methaneStatus}
              statusText={methaneStatusText}
              thresholdText="LEL Safety Cap: < 1.0 %"
              minRange={0.0}
              maxRange={5.0}
              currentNumber={methane}
              safeMin={0.0}
              safeMax={1.0}
              isCriticalAlert={methane >= 3.0}
              colorTheme="orange"
              subDetails={[
                { label: 'Degas State', value: methaneSubtitle },
                { label: 'PPM Equiv.', value: `${(methane * 500).toFixed(0)} ppm` },
              ]}
            />

            {/* Metric 8: Phosphate Level (Nutrients & Eutrophication) */}
            <MetricCard
              id="metric-phosphate"
              title="Phosphate Level (PO₄³⁻)"
              value={phosphate.toFixed(2)}
              unit="mg/L"
              secondaryValue={`Δ ${Number(phosphateDelta) > 0 ? '+' : ''}${phosphateDelta}`}
              icon={Leaf}
              status={phosphateStatus}
              statusText={phosphateStatusText}
              thresholdText="Nutrient Limit: < 0.15 mg/L"
              minRange={0.00}
              maxRange={1.20}
              currentNumber={phosphate}
              safeMin={0.00}
              safeMax={0.15}
              isCriticalAlert={phosphate >= 0.40}
              colorTheme="lime"
              subDetails={[
                { label: 'Ecosystem Risk', value: phosphateSubtitle },
                { label: 'Methodology', value: 'Ascorbic Acid Colorimetric' },
              ]}
            />

          </div>
        </div>
      )}

      {/* Secondary Robot Diagnostics Strip */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-5 sm:gap-8">
          
          {/* Battery Status */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800/60 text-emerald-400 border border-slate-700/60">
              <BatteryCharging className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Battery Bank</div>
              <div className="font-mono font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <span>{currentPoint.battery}%</span>
                <span className="text-[10px] text-emerald-400 font-normal">LiFePO4 (24V)</span>
              </div>
            </div>
          </div>

          {/* Solar Generation */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800/60 text-amber-400 border border-slate-700/60">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Solar Array</div>
              <div className="font-mono font-bold text-slate-200 text-xs">
                {currentPoint.solarWatts} <span className="text-[10px] text-amber-400">Watts</span>
              </div>
            </div>
          </div>

          {/* Cruise Speed */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800/60 text-sky-400 border border-slate-700/60">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Propulsion Speed</div>
              <div className="font-mono font-bold text-slate-200 text-xs">
                {currentPoint.speedKnots} <span className="text-[10px] text-sky-400">knots</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800/60 text-indigo-400 border border-slate-700/60">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Navigation Heading</div>
              <div className="font-mono font-bold text-slate-200 text-xs">
                {Math.round(currentPoint.heading)}° <span className="text-[10px] text-indigo-400">TRUE</span>
              </div>
            </div>
          </div>

          {/* River Flow Rate */}
          <div className="hidden md:flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800/60 text-emerald-400 border border-slate-700/60">
              <Waves className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">River Flow</div>
              <div className="font-mono font-bold text-slate-200 text-xs">
                {currentPoint.flowRate} <span className="text-[10px] text-emerald-400">m³/s</span>
              </div>
            </div>
          </div>

        </div>

        {/* Live GPS Coordinates HUD */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono text-[11px]">
          <span className="text-emerald-400 font-semibold">GPS:</span>
          <span>{currentPoint.lat.toFixed(5)}° N</span>
          <span className="text-slate-700">|</span>
          <span>{Math.abs(currentPoint.lng).toFixed(5)}° W</span>
        </div>
      </div>
    </div>
  );
};
