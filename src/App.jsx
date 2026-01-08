import React, { useState, useEffect, useRef } from 'react';
import { 
  Coffee, 
  Search, 
  Heart, 
  Home, 
  Plus, 
  Minus, 
  Trash2,
  ChevronDown,
  Thermometer,
  Snowflake,
  Flame,
  Scale,
  Bean,
  Cpu,
  Timer,
  Droplets,
  History,
  Save,
  PenLine,
  MapPin,
  Settings,
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  Clock,
  Sparkles,
  Waves,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Share2,
  Camera,
  X,
  Download,
  Instagram,
  Crop,
  Check,
  ToggleLeft
} from 'lucide-react';

// --- Constants ---
const GRIND_SIZES = ['Extra Fine', 'Fine', 'Medium-Fine', 'Medium', 'Medium-Coarse', 'Coarse'];
const PROCESSES = ['Washed', 'Natural', 'Honey', 'Anaerobic', 'Experimental', 'Wet Hull', 'Other'];

const VALVE_PROFILES = [
  { id: 'open', label: 'Standard (Always Open)', desc: 'Standard percolation flow.' },
  { id: 'hybrid', label: 'Hybrid (Closed Bloom)', desc: 'Immersion bloom, then percolation.' },
  { id: 'immersion', label: 'Full Immersion', desc: 'Steep all water, then release.' }
];

const GRINDERS = [
  'Comandante C40',
  'Timemore C2/C3',
  'Baratza Encore',
  'Fellow Ode',
  '1Zpresso JX-Pro',
  'Mahlkönig EK43',
  'Kingrinder K6',
  'Eureka Mignon',
  'Niche Zero',
  'Hario Skerton',
  'Other / Generic'
];

const DRIPPERS = [
  'Hario V60',
  'Kalita Wave',
  'Origami Dripper',
  'Chemex',
  'AeroPress',
  'French Press',
  'Clever Dripper',
  'Hario Switch',
  'April Brewer',
  'Timemore B75',
  'Orea V3',
  'Espresso Machine'
];

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', size = 'md', ...props }) => {
  const baseStyle = "font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100 dark:disabled:bg-slate-700 dark:disabled:text-slate-500";
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 dark:shadow-none",
    secondary: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:text-blue-500",
    ghost: "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base w-full"
  };
  
  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const InputGroup = ({ label, icon: Icon, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {children}
  </div>
);

export default function BrewprintApp() {
  const [activeTab, setActiveTab] = useState('new');
  const [selectedBrew, setSelectedBrew] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Share & Crop State
  const [shareImage, setShareImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const cardRef = useRef(null);
  const cropRef = useRef(null);
  
  // --- Form State ---
  const [beanName, setBeanName] = useState('');
  const [origin, setOrigin] = useState('');
  const [process, setProcess] = useState('Washed');
  
  // --- Brewing Params State ---
  const [valveProfile, setValveProfile] = useState('open'); 
  const [dose, setDose] = useState(15);
  const [ratio, setRatio] = useState(16);
  const [temp, setTemp] = useState('Hot');
  const [waterTemp, setWaterTemp] = useState(93);
  const [grindSize, setGrindSize] = useState('Medium');
  const [pourCount, setPourCount] = useState(2); 

  // --- Timer State ---
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // --- Guided Brew State (New Feature) ---
  const [guideSeconds, setGuideSeconds] = useState(0);
  const [isGuideRunning, setIsGuideRunning] = useState(false);
  const guideTimerRef = useRef(null);

  // --- Theme Init & Script Loader ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);

      const handleChange = (e) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
        if(document.body.contains(script)) {
            document.body.removeChild(script);
        }
      };
    }
  }, []);

  // --- Computed ---
  const yieldAmount = Math.round(dose * ratio);

  // --- Helper: Generate Steps ---
  const generateSteps = (dose, ratio, pours, temp, valve) => {
    const totalYield = dose * ratio;
    let iceWeight = 0;
    let hotWater = totalYield;

    if (temp === 'Ice') {
      iceWeight = Math.round(totalYield * 0.4);
      hotWater = totalYield - iceWeight;
    }

    const bloomWater = dose * 2; 
    const remaining = hotWater - bloomWater;
    
    let steps = [];

    // --- Phase 0: Prep ---
    if (valve === 'immersion' || valve === 'hybrid') {
        steps.push({
            time: 'Prep',
            action: 'Close Valve',
            detail: 'Ensure the dripper switch/valve is in the CLOSED position.',
            weight: null
        });
    }

    if (temp === 'Ice') {
      steps.push({
        time: 'Prep',
        action: 'Add Ice',
        detail: `Add ${iceWeight}g of ice into your server/carafe before placing the dripper.`,
        weight: `${iceWeight}g Ice`
      });
    }

    // --- Phase 1: Bloom ---
    steps.push({ 
      time: '0:00', 
      action: 'Bloom Phase', 
      detail: `Pour ${bloomWater}ml of hot water vigorously to wet all grounds. Swirl gently and wait.`,
      weight: `${bloomWater}ml`
    });

    // Valve Logic: Hybrid opens AFTER bloom
    if (valve === 'hybrid') {
         steps.push({
            time: '0:45',
            action: 'Open Valve',
            detail: 'Switch the valve to OPEN for the percolation phase.',
            weight: null
        });
    }

    // --- Phase 2: Pours ---
    const waterPerPour = remaining / pours;
    let currentTarget = bloomWater;
    let timeSeconds = 45; 

    for (let i = 1; i <= pours; i++) {
       currentTarget += waterPerPour;
       const min = Math.floor(timeSeconds / 60);
       const sec = timeSeconds % 60;
       const timeStr = `${min}:${sec.toString().padStart(2, '0')}`;
       
       steps.push({
         time: timeStr,
         action: `Pour ${i} (${Math.round((i/pours)*100)}%)`,
         detail: `Pour gently in concentric circles until scale reads ${Math.round(currentTarget)}ml.`,
         weight: `${Math.round(currentTarget)}ml`
       });

       timeSeconds += 45; 
    }

    // Valve Logic: Immersion opens at end
    if (valve === 'immersion') {
        const minRelease = Math.floor(timeSeconds / 60);
        const secRelease = timeSeconds % 60;
        steps.push({
            time: `${minRelease}:${secRelease.toString().padStart(2, '0')}`,
            action: 'Open Valve',
            detail: 'Release the switch to start the draw down.',
            weight: null
        });
        timeSeconds += 10; 
    }

    const minDD = Math.floor(timeSeconds / 60);
    const secDD = timeSeconds % 60;
    
    steps.push({
      time: `${minDD}:${secDD.toString().padStart(2, '0')}`,
      action: 'Draw Down',
      detail: 'Allow water to drain completely through the bed.',
      weight: `${Math.round(hotWater)}ml`
    });
    
    steps.push({
      time: `${minDD}:30`, 
      action: 'Serve',
      detail: 'Remove dripper, swirl the carafe to mix (melting remaining ice), and serve.',
      weight: null
    });

    return steps;
  };

  // --- Actions ---
  const handleSaveBrew = () => {
    if (!beanName || !origin) return; 
    
    let iceWeight = 0;
    let hotWater = Math.round(dose * ratio);
    if (temp === 'Ice') {
        iceWeight = Math.round((dose * ratio) * 0.4);
        hotWater = (dose * ratio) - iceWeight;
    }

    const newBrew = {
      id: Date.now(),
      beanName,
      origin,
      process,
      valveProfile,
      dose,
      ratio,
      yieldAmount,
      iceWeight,
      hotWater,
      type: temp,
      waterTemp: temp === 'Hot' ? waterTemp : '94',
      grindSize,
      pourCount,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      steps: generateSteps(dose, ratio, pourCount, temp, valveProfile)
    };

    setSelectedBrew(newBrew);
    setActiveTab('detail');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setIsCropping(true);
        setCropScale(1);
        setCropPos({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Crop Logic ---
  const handleCropComplete = async () => {
    if (!cropRef.current || !window.html2canvas) return;
    
    setIsGenerating(true);
    try {
      const { offsetWidth, offsetHeight } = cropRef.current;
      const canvas = await window.html2canvas(cropRef.current, {
        useCORS: true,
        scale: 2, 
        backgroundColor: null,
        width: offsetWidth,
        height: offsetHeight,
        onclone: (clonedDoc) => {
            const grid = clonedDoc.getElementById('crop-grid');
            if (grid) grid.style.display = 'none';
        }
      });
      setShareImage(canvas.toDataURL('image/png'));
      setIsCropping(false);
      setTempImage(null);
    } catch (err) {
      console.error("Crop failed", err);
      alert("Failed to crop image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    setDragStart({ x: clientX - cropPos.x, y: clientY - cropPos.y });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    setCropPos({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // --- Share Logic ---
  const generateCanvas = async () => {
    if (!cardRef.current || !window.html2canvas) {
      console.error("html2canvas not loaded or card not found");
      return null;
    }
    return await window.html2canvas(cardRef.current, { 
      useCORS: true, 
      scale: 3, 
      backgroundColor: null,
      logging: false,
      allowTaint: true,
      imageTimeout: 0,
      ignoreElements: (element) => element.classList.contains('no-export'), // IGNORE CAMERA ICON
      onclone: (clonedDoc) => {
          // EXPERIMENTAL FIXES FOR EXPORT
          
          // 1. Fix Top Margin (Push content down significantly)
          const header = clonedDoc.getElementById('card-header');
          if (header) {
             header.style.marginTop = '40px'; 
          }
          
          // 2. Fix Location Icon Alignment & Spacing
          const locationContainer = clonedDoc.getElementById('location-container');
          if (locationContainer) {
              locationContainer.style.display = 'flex';
              locationContainer.style.alignItems = 'center';
              locationContainer.style.marginTop = '-4px'; 
              
              // Target the text
              const text = locationContainer.querySelector('p');
              if (text) {
                  text.style.marginTop = '4px'; 
              }
              
              // Target the icon
              const icon = locationContainer.querySelector('svg');
              if (icon) {
                 icon.style.marginTop = '18px'; 
              }
          }

          // 3. Fix Yield Icon Alignment
          const yieldContainer = clonedDoc.getElementById('yield-container');
          if (yieldContainer) {
              const icon = yieldContainer.querySelector('svg');
              if (icon) {
                 icon.style.marginTop = '18px'; 
              }
          }

          // 4. Fix Chip Alignment - Specific Padding & Margin
          const chipsContainer = clonedDoc.getElementById('chips-container');
          if (chipsContainer) {
             chipsContainer.style.marginTop = '20px'; // Set container margin to 20px
          }

          const chips = clonedDoc.querySelectorAll('.stats-chip');
          chips.forEach(chip => {
             chip.style.display = 'flex';
             chip.style.alignItems = 'center';
             chip.style.justifyContent = 'center';
             chip.style.paddingTop = '4px';  // Set top padding to 4px
             chip.style.paddingBottom = '14px'; // Set bottom padding to 14px
             chip.style.lineHeight = '1';
          });
      }
    });
  };

  const handleSaveImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (canvas) {
        const link = document.createElement('a');
        link.download = `brewprint-${selectedBrew.beanName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        alert("Unable to generate image. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'brewprint.png', { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'My Brewprint',
                text: `Just brewed a ${selectedBrew.beanName} using Brewprint!`,
              });
            } catch (err) {
              if (err.name !== 'AbortError') {
                console.error('Share failed', err);
              }
            }
          } else {
            alert("Sharing is not supported on this browser. Saving image instead.");
            const link = document.createElement('a');
            link.download = `brewprint-share.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error preparing share.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Timer Logic (Simple Tab) ---
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  // --- Guided Brew Logic (New Feature) ---
  useEffect(() => {
    if (isGuideRunning) {
      guideTimerRef.current = setInterval(() => {
        setGuideSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(guideTimerRef.current);
    }
    return () => clearInterval(guideTimerRef.current);
  }, [isGuideRunning]);

  const toggleGuide = () => setIsGuideRunning(!isGuideRunning);
  const resetGuide = () => {
    setIsGuideRunning(false);
    setGuideSeconds(0);
  };

  const timeToSeconds = (timeStr) => {
    if (!timeStr || timeStr === 'Prep') return -1;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const getCurrentStep = () => {
    if (!selectedBrew || !selectedBrew.steps) return null;
    
    // Filter out Prep steps for time comparison, or handle them
    const steps = selectedBrew.steps;
    
    // Find active step
    for (let i = 0; i < steps.length; i++) {
        const currentStepTime = timeToSeconds(steps[i].time);
        const nextStepTime = i + 1 < steps.length ? timeToSeconds(steps[i+1].time) : Infinity;
        
        // Handle Prep
        if (currentStepTime === -1 && guideSeconds === 0) return steps[i];

        if (guideSeconds >= currentStepTime && guideSeconds < nextStepTime && currentStepTime !== -1) {
            return steps[i];
        }
    }
    return steps[steps.length - 1]; // Return last step if finished
  };

  const getNextStep = () => {
      const current = getCurrentStep();
      if (!current) return null;
      const idx = selectedBrew.steps.indexOf(current);
      if (idx !== -1 && idx + 1 < selectedBrew.steps.length) {
          return selectedBrew.steps[idx + 1];
      }
      return null;
  }

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Views ---

  const renderNewBrewForm = () => (
    <div className="max-w-3xl mx-auto w-full pb-32 animate-fade-in space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none mb-2 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Brewprint</h1>
          <p className="text-slate-300">Design your perfect cup recipe.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
        <Coffee className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bean Details - NOW FULL WIDTH ON DESKTOP */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-6 md:col-span-2 transition-colors duration-300">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50 dark:border-slate-800">
            <Bean className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Bean Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <InputGroup label="Bean Name">
                <input 
                type="text" 
                placeholder="e.g. Gayo Wine"
                value={beanName}
                onChange={(e) => setBeanName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                />
             </InputGroup>
             <InputGroup label="Origin" icon={MapPin}>
                <input 
                type="text" 
                placeholder="e.g. Aceh, Indonesia"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                />
             </InputGroup>
             <div className="md:col-span-2">
                 <InputGroup label="Process">
                    <div className="relative">
                    <select 
                        value={process}
                        onChange={(e) => setProcess(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-xl py-3 pl-4 pr-8 appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                 </InputGroup>
             </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-6 md:col-span-2 transition-colors duration-300">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50 dark:border-slate-800">
            <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Parameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Left Col: Temp & Grind */}
             <div>
               <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl flex mb-6">
                <button onClick={() => setTemp('Hot')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${temp === 'Hot' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}><Flame className="w-4 h-4" /> Hot</button>
                <button onClick={() => setTemp('Ice')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${temp === 'Ice' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}><Snowflake className="w-4 h-4" /> Ice</button>
              </div>
              {temp === 'Hot' && (
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 mb-4">
                  <div className="flex justify-between items-center mb-3">
                     <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Water Temp</label>
                     <span className="font-bold text-slate-800 dark:text-white">{waterTemp}°C</span>
                  </div>
                  <input type="range" min="80" max="100" value={waterTemp} onChange={(e) => setWaterTemp(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              )}
               <InputGroup label="Grind Setting">
                 <div className="relative">
                    <select value={grindSize} onChange={(e) => setGrindSize(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-xl py-3 pl-4 pr-8 appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      {GRIND_SIZES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
              </InputGroup>
             </div>
             
             {/* Right Col: Dose, Ratio, Pours */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Dose</label>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setDose(d => Math.max(1, d - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-xl text-slate-800 dark:text-white">{dose}g</span>
                    <button onClick={() => setDose(d => d + 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Ratio</label>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setRatio(r => Math.max(1, r - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-xl text-slate-800 dark:text-white">1:{ratio}</span>
                    <button onClick={() => setRatio(r => r + 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="col-span-2">
                    <InputGroup label="Valve / Switch Profile" icon={ToggleLeft}>
                        <div className="relative">
                        <select 
                            value={valveProfile}
                            onChange={(e) => setValveProfile(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-xl py-3 pl-4 pr-8 appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {VALVE_PROFILES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {/* Helper Text for Valve */}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 pl-1">
                        {VALVE_PROFILES.find(p => p.id === valveProfile)?.desc}
                        </div>
                    </InputGroup>
                </div>
                
                {/* Pour Structure */}
                <div className="col-span-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Waves className="w-3 h-3" /> Pour Structure (After Bloom)
                  </label>
                  <div className="flex gap-2">
                     {[1, 2, 3, 4, 5].map(count => (
                       <button
                         key={count}
                         onClick={() => setPourCount(count)}
                         className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all border ${
                           pourCount === count 
                             ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-none' 
                             : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300'
                         }`}
                       >
                         {count}
                       </button>
                     ))}
                  </div>
                </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Crop Modal ---
  const renderCropModal = () => (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col animate-fade-in">
        <div className="absolute top-4 right-4 z-20 flex gap-4">
            <button 
              onClick={() => { setIsCropping(false); setTempImage(null); }}
              className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
            >
                <X className="w-6 h-6" />
            </button>
            <button 
              onClick={handleCropComplete}
              className="bg-blue-600 text-white p-2 px-4 rounded-full font-bold flex items-center gap-2 shadow-lg"
            >
                <Check className="w-5 h-5" /> Done
            </button>
        </div>

        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            {/* 9:16 Aspect Ratio Frame */}
            <div 
                ref={cropRef}
                className="relative overflow-hidden bg-slate-900 shadow-2xl ring-2 ring-white/20"
                style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    aspectRatio: '9/16'
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <img 
                    src={tempImage} 
                    alt="Crop Preview"
                    className="absolute max-w-none cursor-move origin-center"
                    style={{
                        transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`,
                        width: '100%',
                        height: 'auto',
                        minHeight: '100%'
                    }}
                    draggable={false}
                />
                
                {/* Grid Overlay with ID for targeting */}
                <div id="crop-grid" className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                    <div className="border-r border-b border-white"></div>
                    <div className="border-r border-b border-white"></div>
                    <div className="border-b border-white"></div>
                    <div className="border-r border-b border-white"></div>
                    <div className="border-r border-b border-white"></div>
                    <div className="border-b border-white"></div>
                    <div className="border-r border-white"></div>
                    <div className="border-r border-white"></div>
                    <div className=""></div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="bg-black/80 p-6 pb-10 flex flex-col gap-2">
            <div className="flex justify-between text-white text-xs font-bold uppercase tracking-wider mb-2">
                <span>Zoom</span>
                <span>{Math.round(cropScale * 100)}%</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.1" 
                value={cropScale}
                onChange={(e) => setCropScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-center text-slate-400 text-xs mt-4">Drag to pan • Pinch to zoom</p>
        </div>
    </div>
  );

  const renderShareModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShareModal(false)}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={() => setShowShareModal(false)}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* The Card to Share (16:9 Ratio for Stories) */}
          <div ref={cardRef} className="relative aspect-[9/16] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden group">
             {shareImage ? (
               <img src={shareImage} className="w-full h-full object-cover" alt="Brew Result" crossOrigin="anonymous" />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center">
                  <Coffee className="w-24 h-24 text-white/20" />
               </div>
             )}
             
             {/* Overlay Content with Better Fallback for Capture */}
             <div id="card-overlay" className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 flex flex-col justify-between p-6">
                <div id="card-header" className="text-white/90 mt-8">
                   <h3 className="font-bold text-2xl leading-tight drop-shadow-md">{selectedBrew.beanName}</h3>
                   <div id="location-container" className="flex items-center gap-1.5 text-sm opacity-90 drop-shadow-md mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <p className="leading-none pt-0.5">{selectedBrew.origin}</p>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Stats Card Overlay - Simulating Glass Effect for Capture */}
                  <div 
                     id="stats-card"
                     className={`border rounded-2xl p-4 shadow-xl backdrop-blur-md ${
                        isDarkMode 
                        ? 'bg-black/30 border-white/10 text-white' 
                        : 'bg-white/40 border-white/20 text-slate-900'
                     }`}
                  >
                     <div className="flex justify-between items-end mb-3">
                        <div>
                           <span className={`text-[10px] font-bold uppercase tracking-wider opacity-70 ${isDarkMode ? "text-white" : "text-slate-600"}`}>Total Yield</span>
                           <div id="yield-container" className="text-3xl font-bold flex items-center gap-1 leading-none">
                              <Droplets className={`w-5 h-5 ${isDarkMode ? "fill-white" : "fill-blue-600 text-blue-600"}`} /> 
                              <span>{selectedBrew.yieldAmount}ml</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`text-[10px] font-bold uppercase tracking-wider opacity-70 ${isDarkMode ? "text-white" : "text-slate-600"}`}>Time</span>
                           <div className="text-xl font-bold font-mono">03:00</div>
                        </div>
                     </div>
                     
                     <div id="chips-container" className="flex flex-wrap gap-2 text-xs font-medium opacity-90 mb-4 justify-center">
                        <span className={`stats-chip px-2.5 py-1 rounded-lg border flex items-center justify-center leading-none pb-0.5 ${isDarkMode ? "bg-white/10 border-white/10" : "bg-slate-100 border-slate-200 text-slate-700"}`}>1:{selectedBrew.ratio}</span>
                        <span className={`stats-chip px-2.5 py-1 rounded-lg border flex items-center justify-center leading-none pb-0.5 ${isDarkMode ? "bg-white/10 border-white/10" : "bg-slate-100 border-slate-200 text-slate-700"}`}>{selectedBrew.dose}g Dose</span>
                        <span className={`stats-chip px-2.5 py-1 rounded-lg border flex items-center justify-center leading-none pb-0.5 ${isDarkMode ? "bg-white/10 border-white/10" : "bg-slate-100 border-slate-200 text-slate-700"}`}>
                           {selectedBrew.valveProfile === 'open' ? 'Open Valve' : selectedBrew.valveProfile === 'hybrid' ? 'Hybrid Valve' : 'Immersion'}
                        </span>
                     </div>

                     {/* New: Horizontal Pouring Steps */}
                     <div className={`pt-3 border-t ${isDarkMode ? "border-white/20" : "border-slate-200"}`}>
                        <div className="flex justify-between items-end gap-1">
                          {selectedBrew.steps.filter(s => s.weight && !s.action.includes('Serve') && !s.action.includes('Close') && !s.action.includes('Open')).map((step, idx) => {
                            let label = step.action.split(' ')[0];
                            if (step.action.includes('Bloom')) label = 'Bloom';
                            else if (step.action.includes('Pour')) {
                               const match = step.action.match(/Pour (\d+)/);
                               label = match ? `P${match[1]}` : 'Pour';
                            } else if (step.action.includes('Draw')) label = 'End';
                            else if (step.action.includes('Add Ice')) label = 'Ice';
                            else if (step.action.includes('Start')) label = 'Start';
                            else if (step.action.includes('Stop')) label = 'Stop';

                            return (
                              <div key={idx} className="flex flex-col items-center flex-1">
                                 {/* Removed Vertical Line */}
                                 <span className={`text-[8px] font-bold uppercase opacity-60 mb-0.5 ${isDarkMode ? "text-white" : "text-slate-500"}`}>{label}</span>
                                 <span className="text-xs font-bold font-mono">{step.weight.replace(/[^\d]/g, '')}</span>
                                 <span className={`text-[8px] opacity-60 ${isDarkMode ? "text-white" : "text-slate-500"}`}>{step.weight.includes('g') ? 'g' : 'ml'}</span>
                              </div>
                            );
                          })}
                        </div>
                     </div>
                  </div>

                  {/* Watermark */}
                  <div className="text-center pb-2 drop-shadow-md">
                      <p className="text-[10px] text-white/60 font-medium mb-0.5">Created with Brewprint</p>
                      <p className="text-xs text-white/90 font-bold tracking-wide">try on: derysudrajat.github.io/brewprint</p>
                  </div>
                </div>
             </div>

             {/* Camera Button - EXCLUDED FROM EXPORT */}
             {!isGenerating && (
               <label className="no-export absolute top-4 left-4 z-20 cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-lg">
                     <Camera className="w-4 h-4" />
                  </div>
               </label>
             )}
          </div>
        </div>

        {/* Actions - Always at bottom */}
        <div className="p-6 bg-white dark:bg-slate-900 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800">
           <Button 
             className="w-full bg-gradient-to-r from-purple-500 to-pink-500 border-none hover:opacity-90 shadow-lg shadow-purple-200 dark:shadow-none"
             onClick={handleShare}
             disabled={isGenerating}
           >
              <Instagram className="w-5 h-5" /> {isGenerating ? 'Generating...' : 'Share to Stories'}
           </Button>
           <Button 
             variant="outline" 
             className="w-full" 
             onClick={handleSaveImage}
             disabled={isGenerating}
           >
              <Download className="w-5 h-5" /> {isGenerating ? 'Saving...' : 'Save Image'}
           </Button>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedBrew) return null;
    return (
      <div className="max-w-3xl mx-auto w-full pb-32 animate-fade-in space-y-8">
        {/* Navigation & Share */}
        <div className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab('new')} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Brew Guide</h1>
           </div>
           <div className="flex gap-2">
             {/* New Start Guide Button */}
             <button 
               onClick={() => setActiveTab('guided')}
               className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors flex items-center gap-2"
             >
                <PlayCircle className="w-4 h-4" /> Start
             </button>
             <button 
               onClick={() => setShowShareModal(true)}
               className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
             >
                <Share2 className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* 1. SEPARATE Estimated Yield Card */}
        <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-300 dark:shadow-slate-900/50">
           <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">Total Estimated Yield</span>
              <div className="text-7xl font-black tracking-tighter flex items-center gap-2 mb-6 text-white drop-shadow-sm">
                 <Droplets className="w-12 h-12 text-blue-500 fill-blue-500" />
                 {selectedBrew.yieldAmount}<span className="text-3xl text-slate-500 font-bold mt-4">ml</span>
              </div>
              <div className="h-px w-24 bg-slate-700 mb-4"></div>
              <h2 className="text-2xl font-bold mb-1">{selectedBrew.beanName}</h2>
              <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-sm mt-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-sm font-semibold text-slate-300">Target Reached</span>
              </div>
           </div>
           
           {/* Abstract Background */}
           <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl"></div>
        </div>

        {/* 2. Beans & Hardware Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                 <Bean className="w-5 h-5" />
                 <span className="font-bold text-slate-900 dark:text-white text-lg">Bean Details</span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">Origin</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">{selectedBrew.origin}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">Process</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">{selectedBrew.process}</span>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                 <Settings className="w-5 h-5" />
                 <span className="font-bold text-slate-900 dark:text-white text-lg">Brew Parameters</span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">Valve</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right capitalize">{selectedBrew.valveProfile}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">Pours</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">{selectedBrew.pourCount} + Bloom</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 3. Configuration & Specs */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Brew Parameters</span>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300">
                 <span className="text-[10px] uppercase font-bold text-slate-400">Ratio</span>
                 <span className="text-xl font-bold text-slate-900 dark:text-white">1:{selectedBrew.ratio}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300">
                 <span className="text-[10px] uppercase font-bold text-slate-400">Dose</span>
                 <span className="text-xl font-bold text-slate-900 dark:text-white">{selectedBrew.dose}g</span>
              </div>
              
              {/* Conditional Display for Ice/Hot Split */}
              {selectedBrew.type === 'Ice' ? (
                 <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800 shadow-sm flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300">
                       <span className="text-[10px] uppercase font-bold text-blue-400">Ice</span>
                       <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{selectedBrew.iceWeight}g</span>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-3xl border border-orange-100 dark:border-orange-800 shadow-sm flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300">
                       <span className="text-[10px] uppercase font-bold text-orange-400">Hot Water</span>
                       <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{selectedBrew.hotWater}ml</span>
                    </div>
                 </>
              ) : (
                 <>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300">
                       <span className="text-[10px] uppercase font-bold text-slate-400">Pours</span>
                       <span className="text-lg font-bold text-slate-900 dark:text-white truncate w-full px-2">Bloom + {selectedBrew.pourCount}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300">
                       <span className="text-[10px] uppercase font-bold text-slate-400">Temp</span>
                       <span className={`text-xl font-bold ${selectedBrew.type === 'Hot' ? 'text-orange-500' : 'text-cyan-500'}`}>
                          {selectedBrew.type === 'Hot' ? `${selectedBrew.waterTemp}°C` : 'Ice'}
                       </span>
                    </div>
                 </>
              )}
           </div>

           {/* Recommended Time Strip */}
           <div className="bg-blue-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-blue-200 dark:shadow-none">
               <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                     <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">Recommended End Time</span>
               </div>
               <span className="text-xl font-bold font-mono bg-blue-700/50 px-3 py-1 rounded-lg border border-blue-500/50">03:00</span>
           </div>
        </div>

        {/* 4. Step-by-Step Guide */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
           <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-8 flex items-center gap-3">
              <PlayCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Brewing Sequence
           </h3>
           
           <div className="relative space-y-10 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
              {selectedBrew.steps && selectedBrew.steps.map((step, idx) => (
                 <div key={idx} className="relative pl-16">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-50 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center z-10 shadow-sm">
                       <span className="text-sm font-bold">{idx + 1}</span>
                    </div>
                    
                    <div className="pt-1">
                       <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-lg">{step.action}</span>
                          <div className="flex gap-2">
                             {step.weight && (
                               <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                  <Scale className="w-3 h-3" /> {step.weight}
                               </span>
                             )}
                             <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {step.time}
                             </span>
                          </div>
                       </div>
                       <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                          {step.detail}
                       </p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const renderGuidedBrew = () => {
    const currentStep = getCurrentStep();
    const nextStep = getNextStep();

    return (
      <div className="max-w-3xl mx-auto w-full pb-32 animate-fade-in flex flex-col min-h-[80vh] relative">
         {/* Header */}
         <div className="flex items-center gap-4 mb-6">
           <button onClick={() => { setActiveTab('detail'); resetGuide(); }} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guided Brew</h1>
        </div>

        {/* Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative w-80 h-80 flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-[12px] border-slate-100 dark:border-slate-800"></div>
                {/* Active Ring - simplified animation for now */}
                <div className={`absolute inset-0 rounded-full border-[12px] border-blue-600 border-t-transparent transition-all duration-1000 ${isGuideRunning ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '180s' }}></div>
                
                <div className="flex flex-col items-center z-10">
                    <span className="text-8xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter">
                        {formatTime(guideSeconds)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-2">Total Time</span>
                </div>
            </div>

            {/* Current Step Card */}
            <div className="w-full bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl shadow-blue-200 dark:shadow-none text-center transform transition-all duration-500">
                <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Current Step</div>
                <h2 className="text-4xl font-bold mb-4">{currentStep.action}</h2>
                <p className="text-blue-100 text-lg leading-relaxed max-w-md mx-auto">{currentStep.detail}</p>
                {currentStep.weight && (
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/10 px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md">
                        <Scale className="w-5 h-5" />
                        <span className="font-bold text-xl">{currentStep.weight}</span>
                    </div>
                )}
            </div>

            {/* Next Step Preview */}
            {nextStep && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                           <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <span className="text-xs uppercase font-bold text-slate-400">Up Next ({nextStep.time})</span>
                            <div className="font-bold text-slate-700 dark:text-slate-300">{nextStep.action}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="fixed bottom-0 left-0 right-0 p-6 md:pl-32 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 z-40">
           <div className="max-w-3xl mx-auto flex items-center justify-center gap-8">
              <button 
                onClick={resetGuide}
                className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                 <RotateCcw className="w-6 h-6" />
              </button>

              <button 
                onClick={toggleGuide}
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all ${isGuideRunning ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}
              >
                 {isGuideRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
              </button>
           </div>
        </div>
      </div>
    );
  };

  const renderTimer = () => (
    <div className="max-w-3xl mx-auto w-full pb-32 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] space-y-10">
       <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Brew Timer</h1>
          <p className="text-slate-400 dark:text-slate-500">Track your brew perfectly.</p>
       </div>

       {/* Timer Display */}
       <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-[8px] border-slate-100 dark:border-slate-800"></div>
          <div className={`absolute inset-0 rounded-full border-[8px] border-blue-600 border-t-transparent transition-all duration-1000 ${isTimerRunning ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '60s' }}></div>
          
          <div className="flex flex-col items-center z-10">
             <span className="text-7xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter">
                {formatTime(timerSeconds)}
             </span>
             <span className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-2">MM:SS</span>
          </div>
       </div>

       {/* Controls */}
       <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
             <RotateCcw className="w-6 h-6" />
          </button>

          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all ${isTimerRunning ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}
          >
             {isTimerRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
       </div>
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200 md:pl-24 transition-colors duration-300">
        {/* Sidebar Navigation */}
        <nav className="fixed md:left-0 md:top-0 md:bottom-0 md:w-24 md:flex-col md:border-r bottom-0 left-0 right-0 h-20 md:h-auto bg-white dark:bg-slate-900 border-t md:border-t-0 border-slate-200 dark:border-slate-800 z-50 flex flex-row items-center justify-around md:justify-center md:gap-10 shadow-lg md:shadow-none transition-colors duration-300">
           <div className="hidden md:flex flex-col items-center gap-2 mb-auto pt-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-300 dark:shadow-none">
                <Coffee className="w-6 h-6" />
              </div>
           </div>
           <button onClick={() => setActiveTab('new')} className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl ${activeTab === 'new' || activeTab === 'detail' ? 'text-blue-600 dark:text-blue-400 md:bg-blue-50 dark:md:bg-blue-900/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
             <PenLine className="w-6 h-6" />
             <span className="text-[10px] font-bold">New</span>
           </button>
           <button onClick={() => setActiveTab('timer')} className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl ${activeTab === 'timer' ? 'text-blue-600 dark:text-blue-400 md:bg-blue-50 dark:md:bg-blue-900/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
             <Timer className="w-6 h-6" />
             <span className="text-[10px] font-bold">Timer</span>
           </button>
           <div className="hidden md:flex mt-auto pb-8">
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
           </div>
        </nav>

        {/* Main Content Area */}
        <main className="p-4 md:p-10 pt-8 max-w-5xl mx-auto">
          {activeTab === 'new' && renderNewBrewForm()}
          {activeTab === 'detail' && renderDetail()}
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'guided' && renderGuidedBrew()}
        </main>

        {/* Share Modal & Crop Modal */}
        {showShareModal && selectedBrew && renderShareModal()}
        {isCropping && renderCropModal()}

        {/* Floating Action Button - Only for New Brew */}
        {activeTab === 'new' && !isCropping && !showShareModal && (
          <div className="fixed bottom-20 md:bottom-0 left-0 right-0 md:left-24 z-40 pointer-events-none">
            <div className="max-w-5xl mx-auto px-4 pb-4 md:px-10 md:pb-10">
              <div className="max-w-3xl mx-auto flex items-center justify-end">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto shadow-xl shadow-blue-500/40 dark:shadow-none pointer-events-auto transition-transform hover:scale-[1.02]" 
                  onClick={handleSaveBrew}
                  disabled={!beanName || !origin}
                >
                  <Sparkles className="w-5 h-5" />
                  Show Recommendation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}