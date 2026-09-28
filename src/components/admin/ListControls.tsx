import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import Form from "next/form";
import Link from "next/link";
import { listHref, PAGE_SIZE, type ListConfig, type ListState, type ViewKey } from "@/app/admin/list";
import { AutoSubmitSelect } from "./AutoSubmitSelect";

export function ListControls({ tab, config, state, counts }: { tab: string; config: ListConfig; state: ListState; counts: Record<ViewKey, number> }) {
  const statusOptions = config.statusLabels.filter((s) => config.views[state.view].statuses.includes(s.key));

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Filter by state" className="flex flex-wrap gap-2">
        {(Object.keys(config.views) as ViewKey[]).map((key) => (
          <Link
            key={key}
            href={listHref(tab, state, { view: key, status: undefined, page: 1 })}
            aria-current={state.view === key ? "page" : undefined}
            className="chip !min-h-10 aria-[current=page]:border-signal aria-[current=page]:bg-signal/12 aria-[current=page]:text-white"
          >
            {config.views[key].label}
            <span className="font-mono text-xs text-fog">{counts[key]}</span>
          </Link>
        ))}
      </nav>

      <Form action="/admin" className="flex flex-wrap gap-2">
        <input type="hidden" name="tab" value={tab} />
        {state.view !== "active" && <input type="hidden" name="view" value={state.view} />}
        {statusOptions.length > 1 && (
          <label>
            <span className="sr-only">Status</span>
            <AutoSubmitSelect name="status" defaultValue={state.status ?? ""} className="input !min-h-10 !py-2 sm:w-48">
              <option value="">Any status</option>
              {statusOptions.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
        )}
        <label>
          <span className="sr-only">Sort by</span>
          <AutoSubmitSelect name="sort" defaultValue={state.sort} className="input !min-h-10 !py-2 sm:w-56">
            {config.sorts.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </AutoSubmitSelect>
        </label>
        <noscript>
          <button className="btn btn-ghost btn-sm">Apply</button>
        </noscript>
      </Form>
    </div>
  );
}

export function Pagination({ tab, state, total }: { tab: string; state: ListState; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total === 0) return null;
  const from = (state.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(state.page * PAGE_SIZE, total);
  const link = "btn btn-ghost btn-sm";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
      <p className="text-sm text-fog">
        Showing {from}–{to} of {total}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          {state.page > 1 ? (
            <Link href={listHref(tab, state, { page: state.page - 1 })} className={link} rel="prev">
              <CaretLeft size={14} aria-hidden /> Previous
            </Link>
          ) : (
            <span className={link} aria-disabled="true">
              <CaretLeft size={14} aria-hidden /> Previous
            </span>
          )}
          <span className="px-2 font-mono text-sm text-fog">
            {state.page} / {pages}
          </span>
          {state.page < pages ? (
            <Link href={listHref(tab, state, { page: state.page + 1 })} className={link} rel="next">
              Next <CaretRight size={14} aria-hidden />
            </Link>
          ) : (
            <span className={link} aria-disabled="true">
              Next <CaretRight size={14} aria-hidden />
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
