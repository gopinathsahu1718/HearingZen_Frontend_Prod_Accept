// src/features/weather/utils.ts
export const clamp = (n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export const fmtTemp = (t:number)=>`${Math.round(t)}°`;
export const fmtPct = (p:number)=>`${Math.round(p)}%`;
export const kmh = (mps:number)=>Math.round(mps*3.6);
export const km = (m:number)=>Math.round(m/1000);
export const getDay = (iso:string)=>new Date(iso).toLocaleDateString(undefined,{weekday:"short"});
export const fmtTime = (iso:string)=>new Date(iso).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}).replace(/^0/,"");
export const uviBand=(u:number)=>u<3?"Low":u<6?"Moderate":u<8?"High":u<11?"Very High":"Extreme";
export const aqiLabel=(a?:number)=>a==null?"—":a<=50?`Good (${a})`:a<=100?`Moderate (${a})`:a<=150?`USG (${a})`:a<=200?`Unhealthy (${a})`:a<=300?`Very Unhealthy (${a})`:`Hazardous (${a})`;
export const isStormy=(c:number)=>[95,96,99].includes(c);
