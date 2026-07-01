import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../hooks/useTranslation';

const diseaseData = [
  {
    name: 'Urticaria',
    ar: 'الشرى',
    gradient: 'from-rose-500 to-red-600',
    shadow: 'shadow-rose-200 dark:shadow-rose-900/50',
    glow: 'group-hover:shadow-rose-300/60',
    light: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-100 dark:border-rose-900/50',
    accent: '#f43f5e',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/>
            <stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
          <radialGradient id="hive1" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ff6b8a"/>
            <stop offset="100%" stopColor="#e11d48"/>
          </radialGradient>
          <filter id="blur1"><feGaussianBlur stdDeviation="1.5"/></filter>
        </defs>
        {/* Skin base */}
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin1)"/>
        {/* Skin texture lines */}
        <path d="M20 55 Q40 50 60 55 Q80 60 100 55" stroke="#e8b89a" strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M18 65 Q38 60 60 65 Q82 70 102 65" stroke="#e8b89a" strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M22 75 Q42 70 60 75 Q80 78 98 75" stroke="#e8b89a" strokeWidth="0.8" fill="none" opacity="0.5"/>
        {/* Raised hives - wheals */}
        <ellipse cx="38" cy="52" rx="12" ry="8" fill="url(#hive1)" opacity="0.85"/>
        <ellipse cx="38" cy="52" rx="8" ry="5" fill="#ff8fa3" opacity="0.6"/>
        <ellipse cx="38" cy="51" rx="4" ry="2.5" fill="#ffc4cf" opacity="0.7"/>

        <ellipse cx="72" cy="48" rx="10" ry="7" fill="url(#hive1)" opacity="0.8"/>
        <ellipse cx="72" cy="48" rx="6" ry="4" fill="#ff8fa3" opacity="0.6"/>
        <ellipse cx="72" cy="47" rx="3" ry="2" fill="#ffc4cf" opacity="0.7"/>

        <ellipse cx="50" cy="72" rx="14" ry="9" fill="url(#hive1)" opacity="0.9"/>
        <ellipse cx="50" cy="72" rx="9" ry="5.5" fill="#ff8fa3" opacity="0.6"/>
        <ellipse cx="50" cy="71" rx="5" ry="3" fill="#ffc4cf" opacity="0.7"/>

        <ellipse cx="82" cy="68" rx="11" ry="7" fill="url(#hive1)" opacity="0.75"/>
        <ellipse cx="82" cy="68" rx="7" ry="4.5" fill="#ff8fa3" opacity="0.6"/>

        <ellipse cx="30" cy="76" rx="8" ry="5.5" fill="url(#hive1)" opacity="0.7"/>
        <ellipse cx="30" cy="76" rx="5" ry="3.5" fill="#ff8fa3" opacity="0.5"/>

        {/* Small scattered dots */}
        {[[55,58,3],[65,78,2.5],[42,64,2],[88,55,2.5],[25,62,2]].map(([x,y,r],i)=>(
          <circle key={i} cx={x} cy={y} r={r} fill="#f43f5e" opacity="0.6"/>
        ))}
        {/* Erythema glow */}
        <ellipse cx="38" cy="52" rx="14" ry="10" fill="#f43f5e" opacity="0.08" filter="url(#blur1)"/>
        <ellipse cx="50" cy="72" rx="16" ry="11" fill="#f43f5e" opacity="0.08" filter="url(#blur1)"/>
      </svg>
    ),
  },
  {
    name: 'Tinea',
    ar: 'القوباء الحلقية',
    gradient: 'from-emerald-500 to-green-600',
    shadow: 'shadow-emerald-200 dark:shadow-emerald-900/50',
    glow: 'group-hover:shadow-emerald-300/60',
    light: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    accent: '#10b981',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin2)"/>
        {/* Outer ring - raised scaly border */}
        <circle cx="60" cy="62" r="30" stroke="#059669" strokeWidth="4" fill="none" strokeDasharray="0"/>
        <circle cx="60" cy="62" r="30" stroke="#6ee7b7" strokeWidth="2" fill="none" opacity="0.5"/>
        {/* Scale texture on border */}
        {Array.from({length: 24}).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const r1 = 27, r2 = 33;
          const x1 = 60 + r1 * Math.cos(angle), y1 = 62 + r1 * Math.sin(angle);
          const x2 = 60 + r2 * Math.cos(angle), y2 = 62 + r2 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10b981" strokeWidth="1.5" opacity="0.7"/>;
        })}
        {/* Inner healthy skin */}
        <circle cx="60" cy="62" r="24" fill="#fde8d8" opacity="0.8"/>
        {/* Erythema ring */}
        <circle cx="60" cy="62" r="30" stroke="#d1fae5" strokeWidth="6" fill="none" opacity="0.3"/>
        {/* Center - clearing */}
        <circle cx="60" cy="62" r="16" fill="#fef3c7" opacity="0.4"/>
        {/* Hyphal elements */}
        <path d="M50 55 Q55 58 52 65 Q57 62 54 70" stroke="#065f46" strokeWidth="1.2" fill="none" opacity="0.6"/>
        <path d="M65 52 Q68 58 65 63 Q70 60 67 68" stroke="#065f46" strokeWidth="1.2" fill="none" opacity="0.6"/>
        {/* Spores */}
        {[[48,54],[52,68],[67,55],[63,70],[58,60]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill="#065f46" opacity="0.7"/>
        ))}
      </svg>
    ),
  },
  {
    name: 'Lichen Planus',
    ar: 'الحزاز المسطح',
    gradient: 'from-violet-500 to-purple-700',
    shadow: 'shadow-violet-200 dark:shadow-violet-900/50',
    glow: 'group-hover:shadow-violet-300/60',
    light: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-100 dark:border-violet-900/50',
    accent: '#7c3aed',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
          <radialGradient id="papule" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#6d28d9"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin3)"/>
        {/* Flat-topped polygonal papules - characteristic of LP */}
        {[
          [28,55,14,9],[46,50,13,8],[64,52,14,9],[82,54,13,8],
          [36,68,14,9],[55,72,13,8],[72,67,14,9],
          [44,84,12,8],[62,86,12,8],
        ].map(([cx,cy,w,h],i)=>(
          <g key={i}>
            <rect x={cx-w/2} y={cy-h/2} width={w} height={h} rx="2" fill="url(#papule)" opacity="0.85"/>
            {/* Flat top highlight */}
            <rect x={cx-w/2+1} y={cy-h/2+1} width={w-2} height={3} rx="1" fill="#c4b5fd" opacity="0.5"/>
            {/* Wickham striae - white lacy lines */}
            <path d={`M${cx-w/2+2} ${cy} Q${cx} ${cy-2} ${cx+w/2-2} ${cy}`} stroke="white" strokeWidth="0.8" fill="none" opacity="0.7"/>
            <path d={`M${cx-w/2+3} ${cy+2} Q${cx} ${cy} ${cx+w/2-3} ${cy+2}`} stroke="white" strokeWidth="0.6" fill="none" opacity="0.5"/>
          </g>
        ))}
      </svg>
    ),
  },
  {
    name: 'Psoriasis',
    ar: 'الصدفية',
    gradient: 'from-orange-500 to-red-500',
    shadow: 'shadow-orange-200 dark:shadow-orange-900/50',
    glow: 'group-hover:shadow-orange-300/60',
    light: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-100 dark:border-orange-900/50',
    accent: '#f97316',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
          <radialGradient id="plaque" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fed7aa"/><stop offset="100%" stopColor="#c2410c"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin4)"/>
        {/* Large erythematous plaques */}
        <ellipse cx="45" cy="55" rx="22" ry="16" fill="url(#plaque)" opacity="0.9"/>
        <ellipse cx="78" cy="68" rx="18" ry="13" fill="url(#plaque)" opacity="0.85"/>
        <ellipse cx="50" cy="78" rx="16" ry="11" fill="url(#plaque)" opacity="0.8"/>
        {/* Silver scales on plaques */}
        {[
          [34,48],[40,48],[46,48],[52,48],[58,48],
          [36,54],[42,54],[48,54],[54,54],
          [37,60],[43,60],[49,60],[55,60],
          [68,62],[74,62],[80,62],[86,62],
          [70,68],[76,68],[82,68],
          [40,72],[46,72],[52,72],[58,72],
          [42,78],[48,78],[54,78],
        ].map(([x,y],i)=>(
          <ellipse key={i} cx={x} cy={y} rx="3.5" ry="2.2" fill="white" opacity="0.7" stroke="#fed7aa" strokeWidth="0.3"/>
        ))}
        {/* Auspitz sign - pinpoint bleeding spots under scales */}
        {[[45,56],[60,50],[76,65],[50,75]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1" fill="#dc2626" opacity="0.5"/>
        ))}
      </svg>
    ),
  },
  {
    name: 'Mycosis Fungoides',
    ar: 'فطار الفطريات',
    gradient: 'from-teal-500 to-cyan-600',
    shadow: 'shadow-teal-200 dark:shadow-teal-900/50',
    glow: 'group-hover:shadow-teal-300/60',
    light: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-100 dark:border-teal-900/50',
    accent: '#0d9488',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin5)"/>
        {/* Patches - early stage */}
        <ellipse cx="38" cy="50" rx="18" ry="11" fill="#99f6e4" opacity="0.6" stroke="#0d9488" strokeWidth="1"/>
        <ellipse cx="75" cy="55" rx="15" ry="10" fill="#99f6e4" opacity="0.55" stroke="#0d9488" strokeWidth="1"/>
        {/* Plaques - thicker infiltrated */}
        <ellipse cx="48" cy="72" rx="20" ry="13" fill="#2dd4bf" opacity="0.5" stroke="#0f766e" strokeWidth="1.5"/>
        <ellipse cx="80" cy="74" rx="14" ry="9" fill="#2dd4bf" opacity="0.45" stroke="#0f766e" strokeWidth="1.2"/>
        {/* Tumor stage nodule */}
        <circle cx="60" cy="58" r="8" fill="#0d9488" opacity="0.7"/>
        <circle cx="60" cy="58" r="5" fill="#0f766e" opacity="0.8"/>
        <circle cx="58" cy="56" r="2" fill="#99f6e4" opacity="0.6"/>
        {/* Lymphocyte infiltration dots */}
        {[[32,48],[36,54],[42,48],[70,52],[78,58],[44,70],[50,76],[56,72],[78,72],[84,78]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.2" fill="#134e4a" opacity="0.5"/>
        ))}
        {/* Epidermotropism - cells entering epidermis */}
        <path d="M44 65 L44 70 M50 63 L50 68 M56 65 L56 70 M62 63 L62 68" stroke="#0f766e" strokeWidth="0.8" opacity="0.5"/>
      </svg>
    ),
  },
  {
    name: 'Pityriasis Rosea',
    ar: 'النخالية الوردية',
    gradient: 'from-pink-500 to-fuchsia-600',
    shadow: 'shadow-pink-200 dark:shadow-pink-900/50',
    glow: 'group-hover:shadow-pink-300/60',
    light: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-100 dark:border-pink-900/50',
    accent: '#ec4899',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin6" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin6)"/>
        {/* Herald patch - large oval with collarette scale */}
        <ellipse cx="60" cy="38" rx="16" ry="11" fill="#fda4af" opacity="0.8" stroke="#e11d48" strokeWidth="1.5"/>
        <ellipse cx="60" cy="38" rx="10" ry="7" fill="#fb7185" opacity="0.6"/>
        {/* Collarette scale border */}
        {Array.from({length:16}).map((_,i)=>{
          const a=(i/16)*Math.PI*2, r=14;
          return <ellipse key={i} cx={60+r*Math.cos(a)} cy={38+r*0.68*Math.sin(a)} rx="2" ry="1.2" fill="#fecdd3" opacity="0.8" transform={`rotate(${a*180/Math.PI},${60+r*Math.cos(a)},${38+r*0.68*Math.sin(a)})`}/>;
        })}
        {/* Satellite patches - Christmas tree distribution */}
        {[
          [30,52,10,6.5],[50,55,9,6],[70,53,10,6.5],[88,50,8,5.5],
          [22,64,9,6],[40,68,10,6.5],[60,70,9,6],[78,66,10,6.5],[96,62,8,5],
          [28,78,9,5.5],[46,82,10,6.5],[64,82,9,6],[82,78,9,5.5],
          [36,92,8,5],[54,94,9,5.5],[72,92,8,5],
        ].map(([cx,cy,rx,ry],i)=>(
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fda4af" opacity="0.65" stroke="#fb7185" strokeWidth="0.8"/>
            <ellipse cx={cx} cy={cy} rx={rx*0.6} ry={ry*0.6} fill="#fb7185" opacity="0.4"/>
          </g>
        ))}
      </svg>
    ),
  },
  {
    name: 'Drug Eruption',
    ar: 'الملطخ الدوائي',
    gradient: 'from-red-600 to-rose-700',
    shadow: 'shadow-red-200 dark:shadow-red-900/50',
    glow: 'group-hover:shadow-red-300/60',
    light: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-100 dark:border-red-900/50',
    accent: '#dc2626',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin7" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
          <radialGradient id="spot" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fca5a5"/><stop offset="100%" stopColor="#dc2626"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin7)"/>
        {/* Morbilliform/maculopapular eruption - widespread */}
        {[
          [22,42,5,3.5],[32,38,6,4],[42,40,5.5,3.5],[52,36,6,4],[62,39,5,3.5],[72,37,6,4],[82,40,5.5,3.5],[95,42,5,3.5],
          [25,52,5.5,3.5],[36,55,6,4],[46,52,5,3.5],[56,50,6,4],[66,53,5.5,3.5],[76,51,6,4],[88,54,5,3.5],
          [20,63,5,3.5],[30,66,6,4],[42,63,5.5,3.5],[52,65,6,4],[62,62,5,3.5],[72,64,6,4],[83,62,5.5,3.5],[96,65,5,3.5],
          [25,75,5.5,3.5],[36,78,6,4],[47,75,5,3.5],[57,77,6,4],[68,75,5.5,3.5],[79,77,5,3.5],[90,75,5,3.5],
          [28,87,5,3.5],[40,89,5.5,3.5],[52,87,6,4],[63,88,5,3.5],[74,87,5.5,3.5],[85,88,5,3.5],
        ].map(([cx,cy,rx,ry],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#spot)" opacity={0.55+Math.random()*0.25}/>
        ))}
        {/* Some confluent areas */}
        <ellipse cx="55" cy="52" rx="15" ry="8" fill="#f87171" opacity="0.2"/>
        <ellipse cx="75" cy="65" rx="12" ry="7" fill="#f87171" opacity="0.2"/>
      </svg>
    ),
  },
  {
    name: 'Bullous Pemphigoid',
    ar: 'الفقاع الفقاعي',
    gradient: 'from-yellow-400 to-amber-500',
    shadow: 'shadow-yellow-200 dark:shadow-yellow-900/50',
    glow: 'group-hover:shadow-yellow-300/60',
    light: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-100 dark:border-yellow-900/50',
    accent: '#f59e0b',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin8" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
          <radialGradient id="bulla" cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.95"/>
            <stop offset="60%" stopColor="#fde68a" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9"/>
          </radialGradient>
          <radialGradient id="fluid" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.2"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#skin8)"/>
        {/* Urticarial base */}
        <ellipse cx="45" cy="55" rx="26" ry="18" fill="#fed7aa" opacity="0.5"/>
        <ellipse cx="78" cy="68" rx="20" ry="14" fill="#fed7aa" opacity="0.45"/>
        {/* Large tense bulla */}
        <ellipse cx="42" cy="53" rx="20" ry="15" fill="url(#bulla)" stroke="#f59e0b" strokeWidth="1.5"/>
        <ellipse cx="42" cy="53" rx="20" ry="15" fill="url(#fluid)"/>
        {/* Specular highlight */}
        <ellipse cx="36" cy="46" rx="7" ry="5" fill="white" opacity="0.55"/>
        <ellipse cx="34" cy="44" rx="3" ry="2" fill="white" opacity="0.8"/>
        {/* Fluid meniscus */}
        <ellipse cx="42" cy="63" rx="18" ry="4" fill="#fbbf24" opacity="0.35"/>

        {/* Medium bulla */}
        <ellipse cx="78" cy="62" rx="15" ry="11" fill="url(#bulla)" stroke="#f59e0b" strokeWidth="1.2"/>
        <ellipse cx="78" cy="62" rx="15" ry="11" fill="url(#fluid)"/>
        <ellipse cx="73" cy="57" rx="5" ry="3.5" fill="white" opacity="0.55"/>
        <ellipse cx="71" cy="55" rx="2" ry="1.5" fill="white" opacity="0.8"/>

        {/* Small ruptured bulla */}
        <ellipse cx="55" cy="78" rx="11" ry="8" fill="#fde68a" opacity="0.5" stroke="#d97706" strokeWidth="1"/>
        <path d="M49 74 Q55 72 61 74" stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.7"/>
        {/* Erosion */}
        <ellipse cx="55" cy="78" rx="7" ry="5" fill="#fca5a5" opacity="0.4"/>
      </svg>
    ),
  },
  {
    name: 'Seborrheic Dermatitis',
    ar: 'التهاب الجلد الدهني',
    gradient: 'from-amber-500 to-yellow-600',
    shadow: 'shadow-amber-200 dark:shadow-amber-900/50',
    glow: 'group-hover:shadow-amber-300/60',
    light: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-100 dark:border-amber-900/50',
    accent: '#d97706',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="skin9" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fde8d8"/><stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
          <radialGradient id="scalp" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fef3c7"/><stop offset="100%" stopColor="#fde68a"/>
          </radialGradient>
        </defs>
        {/* Face/scalp outline */}
        <ellipse cx="60" cy="58" rx="36" ry="44" fill="url(#skin9)"/>
        {/* Erythematous base - nasolabial, eyebrows, scalp */}
        <ellipse cx="60" cy="32" rx="32" ry="14" fill="#fca5a5" opacity="0.35"/>
        {/* Eyebrow areas */}
        <ellipse cx="43" cy="48" rx="14" ry="6" fill="#fed7aa" opacity="0.6"/>
        <ellipse cx="77" cy="48" rx="14" ry="6" fill="#fed7aa" opacity="0.6"/>
        {/* Nasolabial folds */}
        <ellipse cx="48" cy="65" rx="8" ry="12" fill="#fbbf24" opacity="0.35"/>
        <ellipse cx="72" cy="65" rx="8" ry="12" fill="#fbbf24" opacity="0.35"/>
        {/* Greasy yellow scales */}
        {[
          [38,24,10,5],[48,20,9,4.5],[58,18,10,5],[68,20,9,4.5],[78,24,10,5],
          [34,30,8,4],[44,28,9,4.5],[54,26,8,4],[64,27,9,4.5],[74,29,8,4],[84,30,8,4],
          [36,45,9,4.5],[50,46,8,4],[70,46,9,4.5],[84,45,8,4],
          [44,62,8,4],[52,66,8,4],[68,64,8,4],[76,62,8,4],
        ].map(([cx,cy,rx,ry],i)=>(
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fcd34d" opacity="0.7" stroke="#d97706" strokeWidth="0.5"/>
            <ellipse cx={cx-1} cy={cy-1} rx={rx*0.5} ry={ry*0.5} fill="#fef3c7" opacity="0.6"/>
          </g>
        ))}
        {/* Facial features */}
        <ellipse cx="43" cy="52" rx="8" ry="4" fill="#92400e" opacity="0.3"/>
        <ellipse cx="77" cy="52" rx="8" ry="4" fill="#92400e" opacity="0.3"/>
        <circle cx="43" cy="62" r="4" fill="#f5c5a3" stroke="#d97706" strokeWidth="0.5"/>
        <circle cx="77" cy="62" r="4" fill="#f5c5a3" stroke="#d97706" strokeWidth="0.5"/>
        <path d="M50 75 Q60 80 70 75" stroke="#92400e" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const supportedDiseaseData = [
  { ...diseaseData[4], name: 'MF / Mycosis Fungoides', ar: 'فطار الفطرانيات (MF)' },
  { ...diseaseData[2], name: 'Annular Lichen', ar: 'الحزاز الحلقي' },
  {
    name: 'Healthy Skin',
    ar: 'جلد سليم',
    gradient: 'from-sky-500 to-blue-600',
    shadow: 'shadow-sky-200 dark:shadow-sky-900/50',
    glow: 'group-hover:shadow-sky-300/60',
    light: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-100 dark:border-sky-900/50',
    accent: '#0ea5e9',
    svg: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="healthySkin" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fde8d8"/>
            <stop offset="100%" stopColor="#f5c5a3"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="65" rx="48" ry="40" fill="url(#healthySkin)"/>
        <path d="M25 55 Q42 50 60 55 Q78 60 95 55" stroke="#e8b89a" strokeWidth="1" fill="none" opacity="0.45"/>
        <path d="M24 68 Q42 63 60 68 Q78 73 96 68" stroke="#e8b89a" strokeWidth="1" fill="none" opacity="0.35"/>
        <path d="M35 80 Q50 77 65 80 Q78 83 90 80" stroke="#e8b89a" strokeWidth="1" fill="none" opacity="0.3"/>
        <circle cx="45" cy="55" r="2" fill="#f1b894" opacity="0.45"/>
        <circle cx="75" cy="70" r="1.8" fill="#f1b894" opacity="0.4"/>
        <path d="M44 62 Q60 76 78 58" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      </svg>
    ),
  },
  diseaseData[3],
  { ...diseaseData[1], name: 'Tinea Circinata', ar: 'تينيا حلقية' },
  diseaseData[0],
];

const DetectableDiseases = () => {
  const { t, language } = useTranslation();
  const isArabic = language === 'ar';
  const [hovered, setHovered] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);

  const isHealthyCard = (disease) => {
    const englishName = (disease?.en || disease?.name || '').toLowerCase();
    return englishName.includes('healthy');
  };
  const displayDiseaseData = supportedDiseaseData.filter((disease) => !isHealthyCard(disease));
  const diseases = (t.detectableDiseases?.diseases || supportedDiseaseData.map(d => ({ en: d.name, ar: d.ar })))
    .filter((disease) => !isHealthyCard(disease));
  const modalLabels = t.detectableDiseases?.modalLabels || {};

  useEffect(() => {
    if (!selectedDisease) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedDisease(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDisease]);

  return (
    <section className="py-28 bg-gradient-to-b from-[#F3F7FA] via-[#EEF4F8] to-[#F6F9FC] dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40"/>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40"/>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-100 dark:border-blue-800/50 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
            <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm tracking-wide">
              {t.detectableDiseases?.badge || 'AI-Powered Detection'}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
            {t.detectableDiseases?.title || 'Detectable Skin Diseases'}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t.detectableDiseases?.subtitle || 'AI-assisted preliminary analysis for the skin conditions supported by the current model.'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {diseases.map((disease, index) => {
            const data = displayDiseaseData[index] || displayDiseaseData[0];
            const isHovered = hovered === index;
            return (
              <button
                type="button"
                key={index}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelectedDisease({ disease, data })}
                className={`group relative w-full text-left rtl:text-right bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden cursor-pointer border ${data.border} transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/25 ${
                  isHovered
                    ? `shadow-2xl ${data.shadow} -translate-y-2`
                    : 'shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Top color bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${data.gradient}`}/>

                {/* Illustration */}
                <div className={`${data.light} p-4 flex items-center justify-center relative overflow-hidden`} style={{height: '120px'}}>
                  <div className="w-24 h-24 relative z-10 drop-shadow-sm">
                    {data.svg}
                  </div>
                  {/* Subtle glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${data.gradient} transition-opacity duration-300 ${isHovered ? 'opacity-8' : 'opacity-0'}`}
                    style={{opacity: isHovered ? 0.08 : 0}}/>
                </div>

                {/* Info */}
                <div className={`p-3.5 pb-4 ${isArabic ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-1.5 mb-1.5 ${isArabic ? 'justify-end' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${data.gradient}`}/>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {t.detectableDiseases?.cardLabel || 'Supported class'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                    {isArabic ? disease.ar || data.ar : disease.en || data.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium" dir={isArabic ? 'ltr' : 'rtl'}>
                    {isArabic ? disease.en || data.name : disease.ar || data.ar}
                  </p>
                </div>

                {/* Bottom gradient line on hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${data.gradient} transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}/>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-14 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {t.detectableDiseases?.ctaText || 'Advanced AI models trained on extensive dermatological datasets'}
          </p>
        </div>
      </div>

      {selectedDisease && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disease-modal-title"
          onClick={() => setSelectedDisease(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-hidden bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
            dir={isArabic ? 'rtl' : 'ltr'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`h-1.5 bg-gradient-to-r ${selectedDisease.data.gradient} flex-shrink-0`} />

            <button
              type="button"
              onClick={() => setSelectedDisease(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-xl font-bold"
              aria-label={modalLabels.close || 'Close'}
            >
              ×
            </button>

            <div className="p-6 sm:p-8 pb-5 flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-4 rtl:gap-4 mb-6 pr-12 rtl:pr-0 rtl:pl-12">
                <div className={`${selectedDisease.data.light} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border ${selectedDisease.data.border}`}>
                  <div className="w-12 h-12">
                    {selectedDisease.data.svg}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
                    {t.detectableDiseases?.cardLabel || 'Supported class'}
                  </p>
                  <h3 id="disease-modal-title" className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {isArabic ? selectedDisease.disease.ar : selectedDisease.disease.en}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isArabic ? selectedDisease.disease.en : selectedDisease.disease.ar}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-5 overflow-y-auto">
              <div className="space-y-4">
                {[
                  { label: modalLabels.overview || 'Overview', value: selectedDisease.disease.overview },
                  { label: modalLabels.signs || 'Common signs', value: selectedDisease.disease.signs },
                  { label: modalLabels.recommendations || 'Recommendations', value: selectedDisease.disease.recommendations },
                  { label: modalLabels.consult || 'When to consult a dermatologist', value: selectedDisease.disease.consult },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 dark:bg-gray-800/70 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      {item.label}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 p-4">
                <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                  {modalLabels.disclaimerTitle || 'Medical disclaimer'}
                </h4>
                <p className="text-sm text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                  {modalLabels.disclaimer || 'This information is educational only and does not replace professional medical diagnosis or treatment.'}
                </p>
              </div>

              <div className="mt-6 flex justify-end rtl:justify-start">
                <button
                  type="button"
                  onClick={() => setSelectedDisease(null)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all"
                >
                  {modalLabels.close || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </section>
  );
};

export default DetectableDiseases;
