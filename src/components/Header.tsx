import type { CopySet } from '../data/translations.ts';

interface HeaderProps {
  copy: CopySet;
  selectedCount: number;
  onBuildRoutineClick: () => void;
}

export function Header({ copy, selectedCount, onBuildRoutineClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#141213]/10 bg-[#FAF8F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          className="font-display text-2xl font-bold tracking-tight text-[#141213] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff003b]"
        >
          {copy.brandWordmark}
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C5658]"
        >
          <a
            href="#catalog"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141213] hover:underline hover:decoration-[#e3a535] hover:underline-offset-4"
          >
            {copy.navCatalog}
          </a>
          <a
            href="#routine-studio"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141213] hover:underline hover:decoration-[#e3a535] hover:underline-offset-4"
          >
            {copy.navSelected}
          </a>
          <a
            href="#advisor-chat"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141213] hover:underline hover:decoration-[#e3a535] hover:underline-offset-4"
          >
            {copy.navAdvisor}
          </a>
          <a
            href="#methodology"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#141213] hover:underline hover:decoration-[#e3a535] hover:underline-offset-4"
          >
            {copy.navMethodology}
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onBuildRoutineClick}
            className="inline-flex items-center gap-2 rounded-sm bg-[#ff003b] px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#d90032] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
          >
            <span>{copy.navCta}</span>
            <span className="tabular-nums opacity-90">({selectedCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
