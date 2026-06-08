"use client";

interface TabActionsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function TabActions({
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
  showBack = false,
}: TabActionsProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2 border-t border-brand-100">
      {showBack && onBack ? (
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="btn-primary min-w-[120px]"
        >
          {nextLabel} →
        </button>
      )}
    </div>
  );
}
