export async function fetchWindowedItems({
  after,
  before,
  opts = {},
  defaultPageLimit,
  defaultBatchLimit,
  useOptionLimit = true,
  fetchBatch,
  getItemStartTime,
}) {
  const items = [];
  const seen = new Set();
  const afterTs = Math.floor(after);
  let cursorBefore = Math.floor(
    Number.isFinite(opts?.cursorBefore) ? opts.cursorBefore : before,
  );
  const pageLimit = Math.max(
    1,
    Number.isFinite(opts?.pageLimit)
      ? Math.floor(opts.pageLimit)
      : defaultPageLimit,
  );
  const batchLimit = useOptionLimit
    ? Math.max(
        1,
        Number.isFinite(opts?.limit)
          ? Math.floor(opts.limit)
          : defaultBatchLimit,
      )
    : defaultBatchLimit;
  const onPage = typeof opts?.onPage === "function" ? opts.onPage : null;

  for (let page = 0; page < pageLimit; page++) {
    const batch = await fetchBatch({
      after: afterTs,
      before: cursorBefore,
      limit: batchLimit,
      page,
    });
    if (!Array.isArray(batch) || !batch.length) break;

    for (const item of batch) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }

    onPage?.(items, {
      page,
      done: false,
    });

    const oldest = Math.min(
      ...batch.map((item) => Math.floor(getItemStartTime(item, before))),
    );
    if (batch.length < batchLimit || oldest <= afterTs) break;
    cursorBefore = oldest - 1;
  }

  onPage?.(items, { page: -1, done: true });
  return items;
}
