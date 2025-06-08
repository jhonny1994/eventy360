"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

/**
 * GlobalBackground - Provides a full-page animated particle background
 * 
 * Features:
 * - Used across the entire application
 * - Theme-aware (light/dark mode)
 * - Performance optimized with reduced particle count
 * - Positioned behind all content with proper z-index
 * - Prevents overflow with proper constraints
 */
const GlobalBackground = () => {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize the particles engine only once
    const initEngine = async () => {
      await initParticlesEngine(async (engine: Engine) => {
        await loadSlim(engine);
      });
      setInit(true);
    };
    
    initEngine().catch(console.error);

    // Target the global background element for portal rendering
    const targetElement = document.getElementById("global-background");
    if (targetElement) {
      // The element exists, particles will render there
      return () => {
        // Cleanup if needed
      };
    }
  }, []);

  // Memoize options to prevent unnecessary recalculations
  const options: ISourceOptions = useMemo(() => {
    const baseOptions = {
      fpsLimit: 60,
      fullScreen: {
        enable: false,
        zIndex: -1
      },
      background: {
        color: {
          value: "transparent"
        }
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        collisions: {
          enable: true,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: true,
          speed: 0.8, // Slightly reduced for better performance site-wide
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          // Fewer particles for better site-wide performance
          value: 10,
        },
        opacity: {
          value: { min: 0.3, max: 0.8 },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 5, max: 20 },
        },
      },
      detectRetina: true,
    } as const;

    // Theme-specific particle configurations
    if (theme === "dark") {
      return {
        ...baseOptions,
        particles: {
          ...baseOptions.particles,
          color: {
            value: ["#3b82f6", "#10b981", "#f97316", "#ec4899"],
          },
        },
      };
    }

    return {
      ...baseOptions,
      particles: {
        ...baseOptions.particles,
        color: {
          value: ["#3b82f6", "#10b981", "#f97316", "#ec4899"],
        },
        opacity: {
          value: { min: 0.4, max: 0.9 },
        }
      },
    };
  }, [theme]);

  if (!init) return null;

  return (
    <>
      {/* Static background color */}
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-[#111827]" : "bg-[#f9fafb]"}`}></div>
      
      {/* Particles container */}
      <div className="absolute inset-0 overflow-hidden max-w-full">
        <Particles
          id="tsparticles-global"
          particlesLoaded={async () => {}}
          options={options}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </>
  );
};

export default GlobalBackground; 