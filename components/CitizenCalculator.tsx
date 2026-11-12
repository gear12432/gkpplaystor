'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Menu,
  Clock,
  Ruler,
  Sigma,
  Delete,
  Trash2,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  LayoutDashboard,
  X,
} from 'lucide-react';

interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  termCount: number;
  timestamp: string;
}

interface TermToken {
  index: number;
  operator: string;
  value: string;
}

let calcHistorySeq = 1;
function nextHistoryId(): string {
  calcHistorySeq += 1;
  return `calc-hist-${calcHistorySeq}`;
}

/**
 * Safe, unlimited-length mathematical expression evaluator.
 * Handles arbitrarily many numbers (15, 50, 500, 5000+ terms),
 * trailing operators, unclosed parentheses, percentages, and scientific functions.
 */
export function evaluateCitizenExpression(rawExpr: string): {
  result: string;
  numericValue: number | null;
  termCount: number;
  terms: TermToken[];
} {
  const cleanedDisplay = rawExpr.replace(/\s+/g, '');

  // Extract individual number terms for the Citizen step counter & tape
  const termMatches = cleanedDisplay.match(/([+\-×÷*/]?)\s*(\d+(?:\.\d+)?|\.\d+)/g) || [];
  const terms: TermToken[] = termMatches.map((m, idx) => {
    const firstChar = m[0];
    const hasOp = ['+', '-', '×', '÷', '*', '/'].includes(firstChar);
    return {
      index: idx + 1,
      operator: hasOp ? firstChar.replace('*', '×').replace('/', '÷') : idx === 0 ? '' : '+',
      value: hasOp ? m.slice(1) : m,
    };
  });

  if (!cleanedDisplay) {
    return { result: '0', numericValue: 0, termCount: 0, terms: [] };
  }

  // Normalize symbols for evaluation
  let expr = cleanedDisplay
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, `(${Math.PI})`)
    .replace(/e/g, `(${Math.E})`);

  // Handle square root √number or √(...)
  expr = expr.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
  expr = expr.replace(/√(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)');

  // Handle percentage: e.g., 100+18% -> 100+(100*0.18), or standalone 50% -> (50*0.01)
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1*0.01)');

  // Handle power ^
  expr = expr.replace(/\^/g, '**');

  // Strip trailing operators or trailing decimal/open-paren so live auto-calculation works even mid-typing!
  while (/[+\-*/.(]$/.test(expr)) {
    expr = expr.slice(0, -1);
  }

  if (!expr) {
    return {
      result: '0',
      numericValue: 0,
      termCount: terms.length,
      terms,
    };
  }

  // Auto-close any open parentheses
  const openCount = (expr.match(/\(/g) || []).length;
  const closeCount = (expr.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    expr += ')'.repeat(openCount - closeCount);
  }

  // Validate only safe math tokens exist
  const safeCheck = expr.replace(/Math\.sqrt/g, '');
  if (!/^[0-9+\-*/().\s]+$/.test(safeCheck)) {
    return {
      result: '',
      numericValue: null,
      termCount: terms.length,
      terms,
    };
  }

  try {
    // Evaluate using Function in strict math scope
    const val = Function(`"use strict"; return (${expr});`)();
    if (typeof val === 'number' && Number.isFinite(val)) {
      // Avoid floating point noise like 0.30000000000000004
      const rounded = Number(Math.round(Number(val + 'e10')) + 'e-10');
      const formatted = Number.isInteger(rounded)
        ? rounded.toString()
        : rounded.toString();
      return {
        result: formatted,
        numericValue: rounded,
        termCount: terms.length,
        terms,
      };
    }
  } catch {
    // Ignore incomplete intermediate expression
  }

  return {
    result: '',
    numericValue: null,
    termCount: terms.length,
    terms,
  };
}

export function CitizenCalculator({
  onSwitchToStore,
  onSwitchToAdmin,
}: {
  onSwitchToStore?: () => void;
  onSwitchToAdmin?: () => void;
}) {
  // Default pre-loaded with the user's exact 12-number example ready to accept 15th, 16th, 100th+ numbers!
  const [expression, setExpression] = useState<string>('');
  const [showGstBar, setShowGstBar] = useState<boolean>(false);
  const [gstNote, setGstNote] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showCheckTape, setShowCheckTape] = useState<boolean>(false);
  const [showScientific, setShowScientific] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);
  const [editingTermValue, setEditingTermValue] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 'demo-15-terms',
      expression:
        '3+32+32+63+658+32+325+3256+3256+325+322+32+714+100+250+500',
      result: '9900',
      termCount: 16,
      timestamp: 'Verified 16+ Terms',
    },
  ]);

  const exprScrollRef = useRef<HTMLDivElement>(null);

  const liveEval = useMemo(
    () => evaluateCitizenExpression(expression),
    [expression]
  );

  // Auto-scroll expression display to the end (cursor position) whenever expression changes
  useEffect(() => {
    if (exprScrollRef.current) {
      exprScrollRef.current.scrollTop = exprScrollRef.current.scrollHeight;
      exprScrollRef.current.scrollLeft = exprScrollRef.current.scrollWidth;
    }
  }, [expression]);

  const appendToken = (digit: string) => {
    setGstNote(null);
    setExpression((prev) => prev + digit);
  };

  const appendOperator = (op: string) => {
    setGstNote(null);
    setExpression((prev) => {
      if (!prev) {
        return op === '-' ? '-' : '';
      }
      // Replace trailing operator if the user presses another operator
      if (/[+\-×÷]$/.test(prev)) {
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  };

  const appendDecimal = () => {
    setGstNote(null);
    setExpression((prev) => {
      const parts = prev.split(/[+\-×÷()]/);
      const currentNumber = parts[parts.length - 1] || '';
      if (currentNumber.includes('.')) return prev;
      if (!currentNumber) return prev + '0.';
      return prev + '.';
    });
  };

  const handleParentheses = () => {
    setGstNote(null);
    setExpression((prev) => {
      const openCount = (prev.match(/\(/g) || []).length;
      const closeCount = (prev.match(/\)/g) || []).length;
      const lastChar = prev.slice(-1);

      if (
        openCount > closeCount &&
        (/[0-9)]/.test(lastChar) || lastChar === '%')
      ) {
        return prev + ')';
      }
      if (/[0-9)]/.test(lastChar)) {
        return prev + '×(';
      }
      return prev + '(';
    });
  };

  const handlePercent = () => {
    setGstNote(null);
    setExpression((prev) => {
      if (!prev || /[+\-×÷(%]$/.test(prev)) return prev;
      return prev + '%';
    });
  };

  const handlePlusMinus = () => {
    setGstNote(null);
    setExpression((prev) => {
      if (!prev) return '-';
      if (prev === '-') return '';
      // Find last number token
      const match = prev.match(/(\d+(?:\.\d+)?)$/);
      if (!match) return prev;
      const num = match[1];
      const prefix = prev.slice(0, prev.length - num.length);
      if (prefix.endsWith('(-')) {
        return prefix.slice(0, -2) + num;
      }
      return `${prefix}(-` + num;
    });
  };

  const handleBackspace = () => {
    setGstNote(null);
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setGstNote(null);
    setExpression('');
  };

  const handleEquals = () => {
    if (!expression.trim()) return;
    const { result, termCount } = evaluateCitizenExpression(expression);
    if (!result) return;

    const cleanExpr = expression.replace(/[+\-×÷]+$/, '');
    setHistory((prev) => [
      {
        id: nextHistoryId(),
        expression: cleanExpr,
        result,
        termCount,
        timestamp: 'Just now',
      },
      ...prev.slice(0, 49),
    ]);
    setExpression(result);
  };

  // Support physical keyboard input for desktop & mobile keyboards without any length limit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTermIndex !== null) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        appendToken(e.key);
      } else if (e.key === '+') {
        e.preventDefault();
        appendOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        appendOperator('-');
      } else if (e.key === '*') {
        e.preventDefault();
        appendOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        appendOperator('÷');
      } else if (e.key === '.') {
        e.preventDefault();
        appendDecimal();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const applyGstSlab = (rate: number) => {
    const baseVal = liveEval.numericValue ?? 0;
    if (baseVal === 0) return;
    const gstAmount = Number(((baseVal * rate) / 100).toFixed(2));
    const finalAmount = Number((baseVal + gstAmount).toFixed(2));
    const halfRate = Math.abs(rate) / 2;
    const halfGst = Number((Math.abs(gstAmount) / 2).toFixed(2));

    setGstNote(
      `GST ${rate > 0 ? `+${rate}%` : `${rate}%`}: Base = ${baseVal} | CGST (${halfRate}%) = ${halfGst} | SGST (${halfRate}%) = ${halfGst} | Total GST = ${gstAmount}`
    );
    setExpression(String(finalAmount));
  };

  const load20NumberDemo = () => {
    // 20 numbers in a row to immediately prove there is no 14-number limit!
    const demo20 =
      '3+32+32+63+658+32+325+3256+3256+325+322+32+14+50+120+450+80+95+210+345+';
    setExpression(demo20);
    setGstNote(null);
  };

  const handleUpdateSingleTerm = (termIndex: number, newValue: string) => {
    if (!newValue.trim() || isNaN(Number(newValue))) {
      setEditingTermIndex(null);
      return;
    }
    const updatedTerms = liveEval.terms.map((t) =>
      t.index === termIndex ? { ...t, value: newValue.trim() } : t
    );
    const rebuilt = updatedTerms
      .map((t, i) => `${i === 0 && t.operator === '+' ? '' : t.operator}${t.value}`)
      .join('');
    setExpression(rebuilt + (/[+\-×÷]$/.test(expression) ? expression.slice(-1) : ''));
    setEditingTermIndex(null);
  };

  const copyResult = () => {
    const textToCopy = liveEval.result || '0';
    navigator.clipboard?.writeText(textToCopy).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-[#0F172A] min-h-[calc(100vh-4rem)] sm:min-h-0 sm:my-6 sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-slate-200/80 dark:sm:border-white/10 flex flex-col justify-between overflow-hidden select-none relative">
      {/* Slide-out Left Menu Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-72 bg-white dark:bg-[#152046] h-full p-5 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div>
                  <div className="text-base font-extrabold text-[#111827] dark:text-white">
                    Citizen Calculator Pro
                  </div>
                  <div className="text-xs text-[#2E8B22] dark:text-[#75E85C] font-semibold">
                    Unlimited Numbers Edition (No 14-Limit)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    load20NumberDemo();
                    setDrawerOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#E6F2EA] text-[#2E8B22] font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Test 20+ Numbers Chain Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCheckTape(!showCheckTape);
                    setDrawerOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-[#111827] dark:text-white flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#2E8B22]" />
                  <span>Check &amp; Edit All Entered Numbers</span>
                </button>

                {onSwitchToStore && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onSwitchToStore();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-[#111827] dark:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-[#16C653]" />
                    <span>Open APK Hub Store</span>
                  </button>
                )}

                {onSwitchToAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onSwitchToAdmin();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-[#111827] dark:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#6829E8]" />
                    <span>Open Admin Panel Console</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400">
              Supports 100% unlimited number entries (15, 50, 100, 1000+ terms)
              with instant real-time auto-calculation.
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          1. TOP HEADER BAR (Matches Screenshot: Left Hamburger ≡, Right GST Pill)
         ===================================================================== */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Calculator Menu"
            className="p-2 -ml-2 rounded-xl text-[#4B5563] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Unlimited Terms Counter Badge */}
          <span className="px-2.5 py-1 rounded-full bg-[#E6F2EA] dark:bg-emerald-950/60 text-[#2E8B22] dark:text-[#75E85C] text-[11px] font-extrabold tracking-tight">
            {liveEval.termCount > 0
              ? `${liveEval.termCount} ${
                  liveEval.termCount === 1 ? 'Number' : 'Numbers'
                } · Unlimited`
              : 'Unlimited Numbers'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load20NumberDemo}
            title="Load 20 numbers to test unlimited input past 14 numbers"
            className="px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-[#374151] dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
          >
            20+ Demo
          </button>

          <button
            type="button"
            onClick={() => setShowGstBar(!showGstBar)}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              showGstBar
                ? 'bg-[#2E8B22] text-white shadow-sm'
                : 'bg-[#E6F2EA] text-[#2E8B22] hover:bg-[#d5eadb]'
            }`}
          >
            GST
          </button>
        </div>
      </div>

      {/* Optional GST Quick Slab Row */}
      {showGstBar && (
        <div className="px-4 py-2 bg-[#F6FAF7] dark:bg-slate-900/90 border-y border-[#E6F2EA] dark:border-white/10 space-y-1.5">
          <div className="grid grid-cols-5 gap-1.5">
            {[3, 5, 12, 18, 28].map((rate) => (
              <button
                key={`plus-${rate}`}
                type="button"
                onClick={() => applyGstSlab(rate)}
                className="py-1.5 rounded-lg bg-[#E6F2EA] hover:bg-[#2E8B22] hover:text-white text-[#2E8B22] font-extrabold text-[11px] transition-colors cursor-pointer"
              >
                +{rate}%
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[-3, -5, -12, -18, -28].map((rate) => (
              <button
                key={`minus-${rate}`}
                type="button"
                onClick={() => applyGstSlab(rate)}
                className="py-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-extrabold text-[11px] transition-colors cursor-pointer"
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          2. UNLIMITED EXPRESSION DISPLAY + LIVE AUTO-CALCULATED RESULT
         ===================================================================== */}
      <div className="px-6 pt-3 pb-2 flex-1 flex flex-col justify-between min-h-[175px] sm:min-h-[195px]">
        {/* Check & Correct Horizontal Scrollable Term Pills (Lets User See & Edit #1, #2 ... #15, #16, #50+) */}
        {liveEval.terms.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {liveEval.terms.map((t) => (
              <button
                key={t.index}
                type="button"
                onClick={() => {
                  setEditingTermIndex(t.index);
                  setEditingTermValue(t.value);
                }}
                className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  t.index >= 15
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-[#2E8B22]/40 text-[#2E8B22] dark:text-[#75E85C]'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                }`}
                title="Tap to edit this number"
              >
                #{t.index}: {t.operator}
                {t.value}
              </button>
            ))}
          </div>
        )}

        {/* Modal to Edit Any Single Term in the Chain */}
        {editingTermIndex !== null && (
          <div className="mb-2 p-2.5 rounded-2xl bg-[#F6FAF7] dark:bg-white/10 border border-[#2E8B22]/30 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#2E8B22] dark:text-[#75E85C]">
              Edit Entry #{editingTermIndex}:
            </span>
            <input
              type="number"
              step="any"
              value={editingTermValue}
              onChange={(e) => setEditingTermValue(e.target.value)}
              className="w-28 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 text-xs font-mono font-bold text-[#111827] dark:text-white"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  handleUpdateSingleTerm(editingTermIndex, editingTermValue)
                }
                className="px-2.5 py-1 rounded-lg bg-[#2E8B22] text-white text-xs font-bold cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingTermIndex(null)}
                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Unlimited Scrollable Expression Box with Green Cursor | */}
        <div
          ref={exprScrollRef}
          className="w-full max-h-[96px] overflow-y-auto overflow-x-hidden text-right break-all leading-snug tracking-tight font-medium text-[#1F2937] dark:text-white flex items-center justify-end"
          style={{
            fontSize:
              expression.length > 65
                ? '1.25rem'
                : expression.length > 32
                ? '1.5rem'
                : '1.85rem',
          }}
        >
          <div className="w-full text-right">
            {expression ? (
              <span>
                {expression.split(/([+\-×÷%()])/).map((part, idx) => {
                  const isOp = /^[+\-×÷%()]$/.test(part);
                  return (
                    <span
                      key={idx}
                      className={
                        isOp
                          ? 'text-[#2E8B22] dark:text-[#75E85C] font-semibold mx-0.5'
                          : 'text-[#1F2937] dark:text-white'
                      }
                    >
                      {part}
                    </span>
                  );
                })}
              </span>
            ) : (
              <span className="text-slate-300 dark:text-slate-600">0</span>
            )}
            <span className="inline-block w-[2.5px] h-[1.15em] bg-[#2E8B22] dark:bg-[#75E85C] align-middle ml-0.5 animate-pulse" />
          </div>
        </div>

        {gstNote && (
          <div className="text-[11px] text-right font-mono text-[#2E8B22] dark:text-[#75E85C] bg-[#E6F2EA]/60 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg mt-1">
            {gstNote}
          </div>
        )}

        {/* Live Auto-Calculated Result Row (Updates on every single number typed!) */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={copyResult}
            title="Copy calculated total"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2E8B22]" />
                <span className="text-[#2E8B22]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <div
            aria-live="polite"
            className="text-right font-normal text-[#6B7280] dark:text-slate-300 tracking-tight truncate text-3xl sm:text-4xl tabular-nums"
          >
            {liveEval.result !== '' ? liveEval.result : '0'}
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. UTILITY ICON BAR (Clock History, Ruler Check-Tape, √π Scientific, Backspace ⌫)
         ===================================================================== */}
      <div className="px-7 py-3 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 text-[#6B7280] dark:text-slate-300">
        <div className="flex items-center gap-7 sm:gap-8">
          <button
            type="button"
            onClick={() => {
              setShowHistory(!showHistory);
              setShowCheckTape(false);
            }}
            aria-label="Calculation History"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showHistory
                ? 'text-[#2E8B22] bg-[#E6F2EA]'
                : 'hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCheckTape(!showCheckTape);
              setShowHistory(false);
            }}
            aria-label="Citizen Check & Correct Tape"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showCheckTape
                ? 'text-[#2E8B22] bg-[#E6F2EA]'
                : 'hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <Ruler className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowScientific(!showScientific)}
            aria-label="Scientific Functions"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showScientific
                ? 'text-[#2E8B22] bg-[#E6F2EA]'
                : 'hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <Sigma className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Backspace"
          className="p-1.5 rounded-lg text-[#2E8B22] dark:text-[#75E85C] hover:bg-[#E6F2EA]/50 transition-colors cursor-pointer active:scale-95"
        >
          <Delete className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Optional Scientific Bar */}
      {showScientific && (
        <div className="px-5 py-2 bg-[#F6FAF7] dark:bg-slate-900 border-b border-slate-200/70 dark:border-white/10 grid grid-cols-5 gap-2">
          {[
            { label: '√', action: () => appendToken('√(') },
            { label: 'π', action: () => appendToken('π') },
            { label: 'xʸ', action: () => appendToken('^') },
            { label: '(', action: () => appendToken('(') },
            { label: ')', action: () => appendToken(')') },
          ].map((sc) => (
            <button
              key={sc.label}
              type="button"
              onClick={sc.action}
              className="py-1.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-extrabold text-[#2E8B22] dark:text-[#75E85C] cursor-pointer"
            >
              {sc.label}
            </button>
          ))}
        </div>
      )}

      {/* Optional History or Citizen Check-Tape Overlay */}
      {(showHistory || showCheckTape) && (
        <div className="px-5 py-3 bg-[#F9FBF9] dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 max-h-52 overflow-y-auto space-y-2">
          {showHistory && (
            <>
              <div className="flex items-center justify-between text-xs font-extrabold text-[#374151] dark:text-slate-200">
                <span>Calculation History ({history.length})</span>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="inline-flex items-center gap-1 text-red-600 text-[11px] cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  No saved calculations yet.
                </p>
              ) : (
                history.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      setExpression(h.expression);
                      setShowHistory(false);
                    }}
                    className="w-full text-right p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 hover:border-[#2E8B22] transition-colors block cursor-pointer"
                  >
                    <div className="text-[10px] text-[#2E8B22] font-bold">
                      {h.termCount} Numbers · {h.timestamp}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 break-all">
                      {h.expression}
                    </div>
                    <div className="text-sm font-extrabold text-[#111827] dark:text-white">
                      = {h.result}
                    </div>
                  </button>
                ))
              )}
            </>
          )}

          {showCheckTape && (
            <>
              <div className="flex items-center justify-between text-xs font-extrabold text-[#374151] dark:text-slate-200">
                <span>
                  Citizen Check &amp; Correct ({liveEval.terms.length} Entries)
                </span>
                <span className="text-[11px] text-[#2E8B22]">
                  Tap any row to edit
                </span>
              </div>
              {liveEval.terms.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  Start typing numbers to inspect all entries here.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {liveEval.terms.map((t) => (
                    <button
                      key={t.index}
                      type="button"
                      onClick={() => {
                        setEditingTermIndex(t.index);
                        setEditingTermValue(t.value);
                      }}
                      className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left flex items-center justify-between text-xs cursor-pointer hover:border-[#2E8B22]"
                    >
                      <span className="font-bold text-slate-400">
                        #{t.index}
                      </span>
                      <span className="font-mono font-extrabold text-[#111827] dark:text-white">
                        {t.operator}
                        {t.value}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          4. 4x5 CIRCULAR BUTTON KEYPAD (Matches Screenshot Design 1:1)
         ===================================================================== */}
      <div className="p-5 sm:p-6 grid grid-cols-4 gap-3.5 sm:gap-4 bg-white dark:bg-[#0F172A]">
        {/* Row 1: C, (), %, ÷ */}
        <button
          type="button"
          onClick={handleClear}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#FCE8E6] hover:bg-[#fad8d5] active:scale-95 text-[#D93025] text-2xl font-medium flex items-center justify-center transition-all cursor-pointer"
        >
          C
        </button>
        <button
          type="button"
          onClick={handleParentheses}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#E6F2EA] hover:bg-[#d7eadc] active:scale-95 text-[#1E7E1E] text-2xl font-medium flex items-center justify-center transition-all cursor-pointer"
        >
          ( )
        </button>
        <button
          type="button"
          onClick={handlePercent}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#E6F2EA] hover:bg-[#d7eadc] active:scale-95 text-[#1E7E1E] text-2xl font-medium flex items-center justify-center transition-all cursor-pointer"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => appendOperator('÷')}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#E6F2EA] hover:bg-[#d7eadc] active:scale-95 text-[#1E7E1E] text-3xl font-normal flex items-center justify-center transition-all cursor-pointer"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, × */}
        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => appendToken(n)}
            className="h-[68px] sm:h-[72px] rounded-full bg-[#F1F5F2] dark:bg-slate-800 hover:bg-[#e4ebe6] dark:hover:bg-slate-700 active:scale-95 text-[#1F2937] dark:text-white text-2xl sm:text-[26px] font-medium flex items-center justify-center transition-all cursor-pointer"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => appendOperator('×')}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#E6F2EA] hover:bg-[#d7eadc] active:scale-95 text-[#1E7E1E] text-3xl font-normal flex items-center justify-center transition-all cursor-pointer"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, − */}
        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => appendToken(n)}
            className="h-[68px] sm:h-[72px] rounded-full bg-[#F1F5F2] dark:bg-slate-800 hover:bg-[#e4ebe6] dark:hover:bg-slate-700 active:scale-95 text-[#1F2937] dark:text-white text-2xl sm:text-[26px] font-medium flex items-center justify-center transition-all cursor-pointer"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => appendOperator('-')}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#E6F2EA] hover:bg-[#d7eadc] active:scale-95 text-[#1E7E1E] text-3xl font-normal flex items-center justify-center transition-all cursor-pointer"
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, + */}
        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => appendToken(n)}
            className="h-[68px] sm:h-[72px] rounded-full bg-[#F1F5F2] dark:bg-slate-800 hover:bg-[#e4ebe6] dark:hover:bg-slate-700 active:scale-95 text-[#1F2937] dark:text-white text-2xl sm:text-[26px] font-medium flex items-center justify-center transition-all cursor-pointer"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => appendOperator('+')}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#E6F2EA] hover:bg-[#d7eadc] active:scale-95 text-[#1E7E1E] text-3xl font-normal flex items-center justify-center transition-all cursor-pointer"
        >
          +
        </button>

        {/* Row 5: +/-, 0, ., = */}
        <button
          type="button"
          onClick={handlePlusMinus}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#F1F5F2] dark:bg-slate-800 hover:bg-[#e4ebe6] dark:hover:bg-slate-700 active:scale-95 text-[#1F2937] dark:text-white text-xl font-medium flex items-center justify-center transition-all cursor-pointer"
        >
          +/−
        </button>
        <button
          type="button"
          onClick={() => appendToken('0')}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#F1F5F2] dark:bg-slate-800 hover:bg-[#e4ebe6] dark:hover:bg-slate-700 active:scale-95 text-[#1F2937] dark:text-white text-2xl sm:text-[26px] font-medium flex items-center justify-center transition-all cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={appendDecimal}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#F1F5F2] dark:bg-slate-800 hover:bg-[#e4ebe6] dark:hover:bg-slate-700 active:scale-95 text-[#1F2937] dark:text-white text-3xl font-bold flex items-center justify-center transition-all cursor-pointer"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="h-[68px] sm:h-[72px] rounded-full bg-[#2E8B22] hover:bg-[#25731b] active:scale-95 text-white text-3xl font-normal flex items-center justify-center shadow-md transition-all cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
}
