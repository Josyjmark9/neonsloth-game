/**
 * SoundManager handles all audio for the neonSLOTH game.
 * Uses a singleton pattern to ensure consistent audio state.
 */

class SoundManager {
  private static instance: SoundManager;
  private bgm: HTMLAudioElement | null = null;
  private sfx: { [key: string]: HTMLAudioElement } = {};
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private constructor() {
    // Initialize BGM
    this.bgm = new Audio('https://cdn.pixabay.com/download/audio/2022/01/21/audio_31183cce05.mp3?filename=cyberpunk-2099-10701.mp3');
    this.bgm.loop = true;
    this.bgm.volume = this.volume * 0.4; // BGM is usually quieter

    // Initialize SFX
    this.sfx = {
      jump: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_78390a3202.mp3?filename=jump-15984.mp3'),
      gameOver: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=game-over-38511.mp3'),
      score: new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_c23032619b.mp3?filename=success-1-6297.mp3'),
      click: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b18417d7.mp3?filename=click-15167.mp3'),
      start: new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_c23032619b.mp3?filename=success-1-6297.mp3')
    };

    // Preload all sounds
    Object.values(this.sfx).forEach(audio => {
      audio.load();
      audio.volume = this.volume;
    });
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public playBGM() {
    if (this.isMuted || !this.bgm) return;
    this.bgm.play().catch(err => console.warn("BGM play blocked by browser:", err));
  }

  public stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  public playSFX(name: keyof typeof this.sfx) {
    if (this.isMuted) return;
    const sound = this.sfx[name];
    if (sound) {
      // Clone to allow overlapping sounds (like rapid jumping)
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(err => console.warn(`SFX ${name} play blocked:`, err));
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgm) {
      if (muted) this.bgm.pause();
      else if (this.bgm.paused) this.playBGM();
    }
  }

  public toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted() {
    return this.isMuted;
  }
}

export const soundManager = SoundManager.getInstance();
