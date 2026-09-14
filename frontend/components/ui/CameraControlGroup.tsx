"use client";

import React from "react";
import { useStore } from "@/lib/store";
import type { NavMode } from "@/lib/store/types";
import { TOKENS } from "./primitives";

export function CameraControlGroup({
  variant = "bar",
  style,
}: {
  variant?: "bar" | "compact";
  style?: React.CSSProperties;
}) {
  const navMode = useStore((s) => s.navMode);
  const setNavMode = useStore((s) => s.setNavMode);

  const buttons: { id: NavMode; label: string; title: string }[] = [
    { id: "OVERVIEW", label: "⊞ Overview", title: "Overview camera of full model" },
    { id: "LAYER_FOCUS", label: "◈ Layer", title: "Focus camera on current layer" },
    { id: "OP_FOCUS", label: "⬡ Op", title: "Focus camera on active operation" },
    { id: "FOLLOW", label: "⟳ Follow", title: "Toggle dynamic camera follow mode during execution" },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        background: TOKENS.surfaceFlat,
        padding: "2px",
        borderRadius: TOKENS.radiusSm,
        border: `1px solid ${TOKENS.border}`,
        ...style,
      }}
      role="group"
      aria-label="Camera Navigation Controls"
    >
      {buttons.map(({ id, label, title }) => {
        const isActive = navMode === id;
        return (
          <button
            key={id}
            onClick={() => {
              if (id === "FOLLOW" && isActive) {
                setNavMode("MANUAL");
              } else {
                setNavMode(id);
              }
            }}
            title={title}
            style={{
              height: variant === "compact" ? "20px" : "22px",
              padding: "0 8px",
              fontSize: "10px",
              fontWeight: isActive ? 600 : 500,
              fontFamily: TOKENS.fontSans,
              borderRadius: TOKENS.radiusSm,
              border: "none",
              cursor: "pointer",
              transition: "all 0.12s ease",
              background: isActive ? TOKENS.accentPrimary : "transparent",
              color: isActive ? "#ffffff" : TOKENS.textSecondary,
              boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
