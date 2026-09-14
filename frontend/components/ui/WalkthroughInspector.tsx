"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import { useStore } from "@/lib/store";
import { CHAPTERS } from "@/lib/walkthrough";
import { fmtShape } from "@/lib/format";
import { getComponentDefinition } from "@/components/scenes/inspect/componentDefinitions";
import DataProvenanceBadge from "./DataProvenanceBadge";
import { TOKENS } from "./primitives";

// Chapter id -> component definition id used to enrich the explainer.
const OP_BY_CHAPTER: Record<string, string | null> = {
  overview: null,
  tokenizer: "op_embed",
  embedding: "op_embed",
  norm: "op_final_norm",
  attention: "op_l0_attn_scores",
  mlp: "op_l0_swiglu",
  softmax: "op_l0_attn_softmax",
};

export default function WalkthroughInspector() {
  const data = useStore((s) => s.data);
  const loading = useStore((s) => s.loading);
  const analyze = useStore((s) => s.analyze);
  const chapterIdx = useStore((s) => s.wtChapter);
  const nextChapter = useStore((s) => s.nextChapter);
  const prevChapter = useStore((s) => s.prevChapter);
  const arch = useStore((s) => s.arch);

  useEffect(() => {
    if (!data && !loading) analyze("The cat sat on the mat.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idx = Math.min(chapterIdx, CHAPTERS.length - 1);
  const ch = CHAPTERS[idx];
  const lines = data ? ch.build(data) : [];

  const m = arch?.metadata;
  const meta = useMemo(
    () => ({
      hiddenSize: m?.hidden_size || data?.hidden_size || 896,
      numHeads: m?.num_heads || data?.num_heads || 14,
      kvHeads: m?.num_kv_heads || 2,
      headDim: Math.floor((m?.hidden_size || 896) / (m?.num_heads || 14)),
      ffnSize: m?.ffn_size || 4864,
      vocabSize: m?.vocab_size || 151936,
      totalLayers: m?.num_layers || data?.num_layers || 24,
    }),
    [m, data]
  );

  const opId = OP_BY_CHAPTER[ch.id] ?? null;
  const comp = useMemo(
    () => (opId ? getComponentDefinition(opId, 0, meta) : null),
    [opId, meta]
  );

  const specRow: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "4px 0",
    fontFamily: TOKENS.fontMono,
    fontSize: "10.5px",
    borderBottom: `1px solid ${TOKENS.border}`,
  };
  const specKey = { color: TOKENS.textMuted, fontSize: "9px", letterSpacing: "0.08em" };
  const specVal = { color: TOKENS.textPrimary, textAlign: "right" as const };

  return (
    <aside className="rightpanel rp-inspector">
      <div className="rp-header">
        <span className="rp-header-title">WALKTHROUGH</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: TOKENS.fontMono, fontSize: "10px", color: TOKENS.textMuted }}>
            CH {idx + 1}/{CHAPTERS.length}
          </span>
          {data && <DataProvenanceBadge origin="real" label="REAL" />}
        </div>
      </div>

      {!data && (
        <div className="rp-section">
          <div className="rp-empty">
            {loading
              ? "Running a real forward pass on “The cat sat on the mat.”…"
              : "Run the forward pass to see real numbers at every step."}
          </div>
        </div>
      )}

      {data && (
        <div className="rp-section">
          <div className="rp-section-header">
            <span className="rp-section-title">{ch.title.toUpperCase()}</span>
            <span style={{ fontFamily: TOKENS.fontMono, fontSize: "9px", color: TOKENS.textMuted, letterSpacing: "0.06em" }}>
              {ch.scene}
            </span>
          </div>
          {lines.map((l, i) => (
            <p
              key={i}
              style={{
                margin: "0 0 8px",
                fontSize: "12px",
                lineHeight: 1.55,
                color: TOKENS.textSecondary,
              }}
            >
              {l}
            </p>
          ))}
        </div>
      )}

      {comp && (
        <div className="rp-section op-context-box">
          <div className="op-ctx-header">
            <span className="op-ctx-title">{comp.title}</span>
            <span className="op-ctx-formula">{comp.formulaType}</span>
          </div>
          <div className="op-spec-grid">
            <div className="op-spec-item">
              <span className="op-spec-label">INPUT</span>
              <span className="op-spec-val">{fmtShape(comp.inputShape)}</span>
            </div>
            <div className="op-spec-item">
              <span className="op-spec-label">OUTPUT</span>
              <span className="op-spec-val">{fmtShape(comp.outputShape)}</span>
            </div>
            <div className="op-spec-item">
              <span className="op-spec-label">LAYER</span>
              <span className="op-spec-val">{comp.layer != null ? `L${comp.layer}` : "GLOBAL"}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={specRow}><span style={specKey}>ROLE</span><span style={specVal}>{comp.subtitle}</span></div>
            <div style={specRow}><span style={specKey}>PARAMS</span><span style={specVal}>{comp.parameterCountFormatted ?? "—"}</span></div>
          </div>
          <div style={{ fontSize: "10.5px", lineHeight: 1.5, color: TOKENS.textSecondary, marginTop: "8px" }}>
            {comp.explanation?.whyItMatters}
          </div>
        </div>
      )}

      <div className="rp-section" style={{ display: "flex", gap: "6px" }}>
        <button
          className="chip-btn"
          onClick={prevChapter}
          disabled={idx <= 0}
          title="Previous chapter"
          style={{ flex: 1 }}
        >
          ‹ Back
        </button>
        <button
          className="chip-btn"
          onClick={nextChapter}
          disabled={idx >= CHAPTERS.length - 1}
          title="Next chapter"
          style={{ flex: 1 }}
        >
          Next ›
        </button>
      </div>
    </aside>
  );
}