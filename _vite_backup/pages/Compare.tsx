import { Link } from 'react-router-dom'
import { useCompare } from '../contexts/CompareContext'
import CompareTable from '../components/CompareTable'

export default function Compare() {
  const { properties, removeFromCompare } = useCompare()

  if (properties.length < 2) {
    return (
      <div className="bg-background-light font-display text-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-6 flex justify-center">
            <span className="material-symbols-outlined text-6xl text-slate-300">compare_arrows</span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Select at least 2 properties to compare</h2>
          <p className="text-slate-500 mb-8">
            Add properties from Projects, Rent, or Resale tabs using the compare checkbox on each card.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90"
            >
              Browse Projects
            </Link>
            <Link
              to="/rent"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Browse Rentals
            </Link>
            <Link
              to="/resale"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Browse Resale
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      <main className="mx-auto w-full max-w-[1440px] px-8 py-10 lg:px-20">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Link to="/">Home</Link>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-accent-gold">Comparison Tool</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-primary lg:text-5xl">Property Comparison</h1>
            <p className="text-lg text-slate-500 max-w-2xl">
              Analyze your selected luxury residences side-by-side. Make data-driven decisions on your next major investment.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined">share</span> Share Comparison
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined">picture_as_pdf</span> Export Report
            </button>
          </div>
        </div>

        <CompareTable properties={properties} onRemove={removeFromCompare} />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <h4 className="font-bold text-primary">Detailed Reports</h4>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                Download comprehensive disclosure packages for each property in this view.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div>
              <h4 className="font-bold text-primary">Appreciation Forecast</h4>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                AI-driven 5-year appreciation estimates based on neighborhood market trends.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <h4 className="font-bold text-primary">Expert Consultation</h4>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                Speak with an advisor about how these options fit your investment profile.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white px-8 py-12 lg:px-20">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2 text-primary">
            <img
              src="/Propertize Logo-01.png"
              alt="Propertize - Live & Rise"
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Propertize. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">language</span>
            </a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">rss_feed</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
