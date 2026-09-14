"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { CHAPTERS, REF_MODELS } from "@/lib/walkthrough";
import { fmtCount } from "@/lib/format";
import ModelSummaryCard from "./ModelSummaryCard";
import { Panel, Section, SectionHeader, Badge, TOKENS } from "./primitives";

export default function WalkthroughSidebar({
  onToggleCollapse,
}: {
  onToggleCollapse?: () => void;
}) {
  const data = useStore((s) => s.data);
  const loading = useStore((s) => s.loading);
  const analyze = useStore((s) => s.analyze);
  const chapterIdx = useStore((s) => s.wtChapter);
  const next = useStore((s) => s.nextChapter);
  const prev = useStore((s) => s.prevChapter);
  const wtModel = useStore((s) => s.wtModel);
  const setWtModel = useStore((s) => s.setWtModel);
  const wtPlaying = useStore((s) => s.wtPlaying);
  const toggleWtPlay = useStore((s) => s.toggleWtPlay);
  const playSpeed = useStore((s) => s.playSpeed);
  const setPlaySpeed = useStore((s) => s.setPlaySpeed);

  useEffect(() => {
    if (!data && !loading) analyze("The cat sat on the mat.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idx = Math.min(chapterIdx, CHAPTERS.length - 1);
  const dataReady = !!data;
  const atEnd = idx >= CHAPTERS.length - 1;

  return (
    <Panel className="left-sidebar">
      <ModelSummaryCard onToggleCollapse={onToggleCollapse} />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* 1. CHAPTERS */}
        <Section>
          <SectionHeader title="CHAPTERS" action={<Badge>{idx + 1}/{CHAPTERS.length}</Badge>} />

          {/* progress */}
          <div style={{ margin: "4px 0 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#a3a3a3" }}>
              <span>Progress</span>
              <span>Chapter {idx + 1} of {CHAPTERS.length}</span>
            </div>
            <div style={{ height: 4, background: "#252525", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${((idx + 1) / CHAPTERS.length) * 100}%`,
                  background: "#ffffff",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {CHAPTERS.map((ch, i) => {
              const isActive = i === idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => useStore.getState().setWtChapter(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    borderRadius: TOKENS.radiusSm,
                    border: `1px solid ${isActive ? TOKENS.borderStrong : TOKENS.border}`,
                    background: isActive ? TOKENS.surfaceHover : "transparent",
                    color: isActive ? TOKENS.textPrimary : TOKENS.textSecondary,
                    fontFamily: TOKENS.fontSans,
                    fontSize: "12px",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: TOKENS.fontMono,
                      color: TOKENS.textMuted,
                      minWidth: "14px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ flex: 1 }}>{ch.title}</span>
                  <span style={{ fontSize: "9px", fontFamily: TOKENS.fontMono, color: TOKENS.textMuted }}>
                    {ch.scene}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 2. CONTROLS */}
        <Section>
          <SectionHeader title="CONTROLS" />
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <button
              className="chip-btn"
              onClick={prev}
              disabled={idx <= 0}
              title="Previous chapter"
            >
              ‹ Back
            </button>
            <button
              className="chip-btn"
              onClick={next}
              disabled={atEnd}
              title="Next chapter"
            >
              Next ›
            </button>
            <button
              className="chip-btn"
              onClick={toggleWtPlay}
              disabled={!dataReady || (atEnd && !wtPlaying)}
              title="Autoplay chapters"
            >
              {wtPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              className="chip-btn"
              onClick={() => setPlaySpeed(playSpeed >= 4 ? 0.5 : playSpeed * 2)}
              title="Autoplay speed"
            >
              {playSpeed}× speed
            </button>
          </div>

          <div style={{ marginTop: "10px" }}>
            <div className="side-title" style={{ margin: "0 0 4px" }}>
              Model scale
            </div>
            <select
              className="wt-modelsel"
              style={{ width: "100%" }}
              value={wtModel}
              onChange={(e) => setWtModel(e.target.value)}
            >
              {REF_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {fmtCount(m.params)} params
                </option>
              ))}
            </select>
          </div>
        </Section>
      </div>
    </Panel>
  );
}