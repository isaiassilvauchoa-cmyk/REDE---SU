import { AlarmLevel } from '../types';

export const playAlarmSound = (level: AlarmLevel) => {
  if (!level) return;
  
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (level === 'red') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime); // Hz
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2); 
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (level === 'yellow') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (level === 'green') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
};
