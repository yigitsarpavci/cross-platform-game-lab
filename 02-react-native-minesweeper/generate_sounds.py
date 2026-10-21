import math
import wave
import struct
import random
import os

SAMPLE_RATE = 44100

def write_wav(filename, samples):
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        for s in samples:
            # clip and pack
            s = max(-1.0, min(1.0, s))
            wav_file.writeframes(struct.pack('h', int(s * 32767)))

def generate_dig():
    # A short marimba/wood block pop.
    duration = 0.15
    samples = []
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        # Envelope: sharp attack, exponential decay
        env = math.exp(-30 * t)
        # FM synthesis for a woody pop
        mod = math.sin(2 * math.pi * 150 * t) * math.exp(-40 * t)
        val = math.sin(2 * math.pi * 350 * t + mod * 2) * env * 0.7
        samples.append(val)
    return samples

def generate_flag():
    # A metallic, reverberating "ting"
    duration = 0.4
    samples = []
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        env = math.exp(-12 * t)
        # Multiple high-frequency harmonics for metallic feel
        v1 = math.sin(2 * math.pi * 1200 * t)
        v2 = math.sin(2 * math.pi * 2050 * t) * 0.5
        v3 = math.sin(2 * math.pi * 3100 * t) * 0.25
        val = (v1 + v2 + v3) * env * 0.4
        samples.append(val)
    return samples

def generate_chord():
    # Heavier thunk for mass reveal
    duration = 0.25
    samples = []
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        env = math.exp(-15 * t)
        freq_sweep = 200 + 300 * math.exp(-40 * t)
        val = math.sin(2 * math.pi * freq_sweep * t) * env * 0.8
        # Add a little noise for impact
        val += (random.random() * 2 - 1) * math.exp(-50 * t) * 0.2
        samples.append(val)
    return samples

def generate_bomb():
    # Deep cinematic explosion: sub-bass sweep + filtered noise
    duration = 1.5
    samples = []
    # Simple lowpass filter state
    lp_val = 0
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        # Sub-bass sweep
        sub_freq = 150 * math.exp(-2 * t) + 30
        sub = math.sin(2 * math.pi * sub_freq * t) * math.exp(-1.5 * t)
        
        # Noise burst
        noise = (random.random() * 2 - 1) * math.exp(-3 * t)
        # Lowpass filter the noise (filter opens up then closes)
        cutoff = 0.05 + 0.5 * math.exp(-5 * t)
        lp_val += (noise - lp_val) * cutoff
        
        val = (sub * 0.8 + lp_val * 0.6) * 0.9
        samples.append(val)
    return samples

def generate_win():
    # Majestic multi-chord chime (C Major 7 arp)
    duration = 2.0
    samples = []
    notes = [523.25, 659.25, 783.99, 987.77] # C5, E5, G5, B5
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        val = 0
        for idx, freq in enumerate(notes):
            delay = idx * 0.1
            if t > delay:
                t_note = t - delay
                env = math.exp(-2.5 * t_note)
                val += math.sin(2 * math.pi * freq * t_note) * env * 0.2
                # Add harmonic
                val += math.sin(2 * math.pi * freq * 2 * t_note) * env * 0.1
        samples.append(val)
    return samples

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "sounds")
os.makedirs(out_dir, exist_ok=True)

write_wav(os.path.join(out_dir, "dig.wav"), generate_dig())
write_wav(os.path.join(out_dir, "flag.wav"), generate_flag())
write_wav(os.path.join(out_dir, "chord.wav"), generate_chord())
write_wav(os.path.join(out_dir, "bomb.wav"), generate_bomb())
write_wav(os.path.join(out_dir, "win.wav"), generate_win())

print("AAA Audio Assets Generated Successfully!")
