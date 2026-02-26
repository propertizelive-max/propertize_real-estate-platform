'use client'

import Link from 'next/link'
import type { CompareProperty } from '@/contexts/CompareContext'
import { toPropertySlug } from '@/lib/slug'

type Props = {
  properties: CompareProperty[]
  onRemove: (id: string) => void
}

function CellContent({
  data,
  highlight,
}: {
  data: string
  highlight?: boolean
}) {
  return (
    <span className={highlight ? 'font-bold text-primary' : 'font-medium text-slate-700'}>
      {data || '—'}
    </span>
  )
}

export default function CompareTable({ properties, onRemove }: Props) {
  const isProject = properties[0]?.listingType === 'Project'

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="sticky-column min-w-[280px] p-8 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined font-bold">analytics</span>
                  <span className="text-sm font-black uppercase tracking-widest">Key Performance</span>
                </div>
              </th>
              {properties.map((p) => (
                <th key={p.id} className="min-w-[340px] border-b border-slate-200 p-6 align-top">
                  <div className="group relative flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={() => onRemove(p.id)}
                      className="absolute -right-2 -top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-md hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                      <img
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={p.image}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-primary">{p.title}</h3>
                      <p className="text-lg font-medium text-accent-gold">{p.price}</p>
                    </div>
                    <Link
                      href={`/property/${toPropertySlug(p.title, Number(p.id))}`}
                      className="w-full rounded-xl bg-primary py-3 text-center text-sm font-bold text-white hover:opacity-90 transition-opacity block"
                    >
                      Book Viewing
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="comparison-table-row">
              <td className="sticky-column p-8 text-sm font-bold text-slate-500">
                {isProject ? 'Starting Price' : 'Price'}
              </td>
              {properties.map((p) => (
                <td key={p.id} className="p-8">
                  <CellContent data={p.price} />
                </td>
              ))}
            </tr>
            <tr className="comparison-table-row">
              <td className="sticky-column p-8 text-sm font-bold text-slate-500">Location</td>
              {properties.map((p) => (
                <td key={p.id} className="p-8 font-medium text-slate-700">
                  {p.location ?? '—'}
                </td>
              ))}
            </tr>
            {isProject ? (
              <>
                <tr className="comparison-table-row">
                  <td className="sticky-column p-8 text-sm font-bold text-slate-500">BHK Range</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-8">
                      <CellContent data={p.beds ?? '—'} />
                    </td>
                  ))}
                </tr>
                <tr className="comparison-table-row">
                  <td className="sticky-column p-8 text-sm font-bold text-slate-500">Area Range</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-8">
                      <CellContent data={p.sqft ? `${p.sqft} sq ft` : '—'} />
                    </td>
                  ))}
                </tr>
                <tr className="comparison-table-row">
                  <td className="sticky-column p-8 text-sm font-bold text-slate-500">Project Status</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-8">
                      <CellContent data="Under Construction / Ready to Move" />
                    </td>
                  ))}
                </tr>
              </>
            ) : (
              <>
                <tr className="comparison-table-row">
                  <td className="sticky-column p-8 text-sm font-bold text-slate-500">Bedrooms / Bathrooms</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-8 font-medium">
                      {p.beds && p.baths ? `${p.beds} / ${p.baths}` : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="comparison-table-row">
                  <td className="sticky-column p-8 text-sm font-bold text-slate-500">Square Feet</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-8">
                      <CellContent data={p.sqft ? `${p.sqft} sq ft` : '—'} />
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/20">
              <td className="sticky-column p-8" />
              <td className="p-10 text-center" colSpan={properties.length}>
                <Link
                  href="/resale"
                  className="inline-flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 px-20 py-10 hover:border-accent-gold hover:bg-white transition-colors group"
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-accent-gold group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl font-bold">add</span>
                  </div>
                  <span className="text-sm font-bold text-slate-500 group-hover:text-primary">Add a Property to Compare</span>
                </Link>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
