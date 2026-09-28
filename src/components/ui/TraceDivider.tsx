/** Section divider drawn as a PCB trace: the lit segment "draws" in when scrolled into view. */
export function TraceDivider() {
  return (
    <div data-reveal="fade" aria-hidden className="container-x">
      <div className="trace-divider">
        <span className="seg max-w-12" />
        <span className="via on" />
        <span className="lit" />
        <span className="via on" />
        <span className="seg" />
        <span className="via" />
        <span className="seg max-w-24" />
      </div>
    </div>
  );
}
