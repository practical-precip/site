"use client";
import { useRef, useState } from "react";
import { columns, topics, priorities, type Cell } from "../data";
import Link from "next/link";
import { assetPath } from "../site-paths";
export function Header({ active = "matrix" }: { active?: string }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">
          p.
        </span>
        <span>
          precip<span className="brand-sub">A DOWNSCALING FIELD GUIDE</span>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <Link aria-current={active === "matrix" ? "page" : undefined} href="/">
          The matrix
        </Link>
        <Link
          aria-current={active === "reading" ? "page" : undefined}
          href="/reading-room"
        >
          Reading room
        </Link>
        <Link
          aria-current={active === "about" ? "page" : undefined}
          href="/about"
        >
          About the guide
        </Link>
      </nav>
      <span className="draft-tag">WORKING DRAFT</span>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <span>PRECIP / A technical field guide</span>
      <span>Provisional guidance. Built for informed evaluation.</span>
      <Link href="/about">Scope & evidence</Link>
    </footer>
  );
}
export default function Matrix() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<{
    row: number;
    column: number;
    cell: Cell;
  } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const rows = topics
    .map((topic, row) => ({ topic, row }))
    .filter(({ topic }) => filter === "all" || filter === topic.id);
  function open(row: number, column: number, cell: Cell) {
    setSelected({ row, column, cell });
    dialog.current?.showModal();
  }
  return (
    <>
      <Header />
      <main id="main" className="home">
        <section className="hero">
          <div>
            <p className="eyebrow">
              <span /> FROM PRODUCT PROPERTIES TO PRACTICAL DECISIONS
            </p>
            <h1>
              Precipitation downscaling.
              <br />
              <em>Start with your application.</em>
            </h1>
            <p className="hero-copy">
              A cheatsheet for choosing what to check. Find the precipitation
              feature you care about, then explore the product properties that
              matter.
            </p>
          </div>
          <div className="hero-aside">
            <span className="tiny-label">A GUIDE, NOT A RANKING</span>
            <p>
              Finer grids.
              <br />
              More members.
              <br />
              <span>Better for your question?</span>
            </p>
            <a href={assetPath("/about/")}>
              Understand the approach <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <section className="matrix-section" aria-labelledby="matrix-title">
          <div className="matrix-heading">
            <div>
              <p className="eyebrow">01 / THE GUIDANCE MATRIX</p>
              <h2 id="matrix-title">What does your application need?</h2>
            </div>
            <label className="filter-label">
              Focus on an application
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All applications</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="legend">
            <div>
              {Object.entries(priorities).map(([id, p]) => (
                <span
                  className={`legend-item ${id}`}
                  key={id}
                  title={p.description}
                >
                  <i>{p.symbol}</i>
                  {p.label}
                </span>
              ))}
            </div>
            <span>
              Click any cell to explore the guidance{" "}
              <span aria-hidden="true">↘</span>
            </span>
          </div>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Guidance matrix, scroll horizontally on smaller screens"
          >
            <table>
              <caption className="sr-only">
                Application needs by downscaled product properties. Each cell
                opens a guidance summary.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="corner">
                    YOUR APPLICATION NEED <span>↓</span>
                    <small>PRODUCT PROPERTIES →</small>
                  </th>
                  {columns.map((col, i) => (
                    <th scope="col" key={col.id}>
                      <span className="col-number">0{i + 1}</span>
                      <span>{col.title}</span>
                      <small>{col.subtitle}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ topic, row }) => (
                  <tr key={topic.id}>
                    <th scope="row">
                      <Link href={`/guidance/${topic.id}`}>
                        <span className="row-number">0{row + 1}</span>
                        {topic.title}
                        <small>{topic.use}</small>
                      </Link>
                    </th>
                    {topic.cells.map((cell, column) => (
                      <td key={column}>
                        <button
                          className={`matrix-cell ${cell.priority}`}
                          onClick={() => open(row, column, cell)}
                          aria-label={`${topic.title}, ${columns[column].title}: ${cell.title}. ${priorities[cell.priority].label}`}
                        >
                          <span className="cell-top">
                            <i>{priorities[cell.priority].symbol}</i>
                            <span className="cell-arrow" aria-hidden="true">
                              ↗
                            </span>
                          </span>
                          <span className="cell-title">{cell.title}</span>
                          <span className="cell-status">
                            {priorities[cell.priority].label}
                          </span>
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="matrix-note">
            <span className="note-mark">i</span>
            <p>
              <strong>Use this as a starting point.</strong> Priorities are
              editorial judgments, not benchmark scores. Suitability depends on
              region, timescale, process, and product version. Every cell links
              to evaluation guidance.
            </p>
            <Link href="/about#evidence">How to read this matrix ↗</Link>
          </div>
        </section>
        <section className="bottom-guide">
          <div>
            <p className="eyebrow">A LITTLE CONTEXT GOES A LONG WAY</p>
            <h2>
              Resolution is a property.
              <br />
              <em>Suitability is a question.</em>
            </h2>
          </div>
          <p>
            Start with the statistic you need. Define its spatial footprint,
            accumulation interval, and planning horizon. Then evaluate candidate
            products against that target.
          </p>
          <Link className="outline-link" href="/reading-room">
            Explore the literature ↗
          </Link>
        </section>
      </main>
      <Footer />
      <dialog
        ref={dialog}
        aria-labelledby="guidance-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {selected && (
          <>
            <button
              className="close"
              autoFocus
              aria-label="Close guidance"
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
            <p className="eyebrow">{topics[selected.row].title}</p>
            <p className="dialog-property">{columns[selected.column].title}</p>
            <span className={`status-badge ${selected.cell.priority}`}>
              {priorities[selected.cell.priority].symbol}{" "}
              {priorities[selected.cell.priority].label}
            </span>
            <h2 id="guidance-title">{selected.cell.title}</h2>
            <p>{selected.cell.summary}</p>
            <div className="quick-check">
              <span className="tiny-label">A PRACTICAL CHECK</span>
              <p>{selected.cell.check}</p>
            </div>
            <p className="draft-note">
              Provisional synthesis. This is not a product rating.
            </p>
            <Link
              className="primary-link"
              href={`/guidance/${topics[selected.row].id}#${columns[selected.column].id}`}
            >
              Read the guidance & evidence <span>→</span>
            </Link>
          </>
        )}
      </dialog>
    </>
  );
}
