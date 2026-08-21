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
  const initialBatchLimit = Math.min(
    batchLimit,
    Math.max(
      1,
      Number.isFinite(opts?.initialBatchLimit)
        ? Math.floor(opts.initialBatchLimit)
        : batchLimit,
    ),
  );
  const onPage = typeof opts?.onPage === "function" ? opts.onPage : null;
  const hasInitialProbe = initialBatchLimit < batchLimit;
  const requestCount = pageLimit + (hasInitialProbe ? 1 : 0);

  for (let requestPage = 0; requestPage < requestCount; requestPage++) {
    const isInitialProbe = hasInitialProbe && requestPage === 0;
    const page = hasInitialProbe ? Math.max(0, requestPage - 1) : requestPage;
    const requestLimit = isInitialProbe ? initialBatchLimit : batchLimit;
    const batch = await fetchBatch({
      after: afterTs,
      before: cursorBefore,
      limit: requestLimit,
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

    if (isInitialProbe) {
      if (batch.length < requestLimit) break;
      continue;
    }

    const oldest = Math.min(
      ...batch.map((item) => Math.floor(getItemStartTime(item, before))),
    );
    if (batch.length < requestLimit || oldest <= afterTs) break;
    cursorBefore = oldest - 1;
  }

  onPage?.(items, { page: -1, done: true });
  return items;
}
