"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

/**
 * AnimatedHeroBackground - Provides dynamic particle animation background
 * 
 * Features:
 * - Responds to theme changes (light/dark) 
 * - Uses tsParticles for optimized canvas rendering
 * - Properly layered to remain below content
 * - Prevents overflow with proper constraints
 */
const AnimatedHeroBackground = () => {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize particle engine only once
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Empty function with no parameters
  const particlesLoaded = async (): Promise<void> => {};

  // Memoize options to prevent unnecessary recalculations
  const options: ISourceOptions = useMemo(() => {
    const baseOptions = {
      fpsLimit: 60,
      fullScreen: false,
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
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          // Reduced particle count for better performance
          value: 80,
        },
        opacity: {
          value: { min: 0.3, max: 0.8 },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 5, max: 15 },
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

  return (
    <div className="absolute inset-0 z-0 overflow-hidden max-w-full">
      {/* Static background color */}
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-[#111827]" : "bg-[#f9fafb]"}`}></div>
      
      {/* Particles container */}
      {init && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={options}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
};

export default AnimatedHeroBackground; 