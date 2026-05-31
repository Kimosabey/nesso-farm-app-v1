import { Platform } from 'react-native';

/**
 * Shared FlatList perf props for the long, vertically-scrolling list screens
 * (Farmers, Farms, Activities, Inventory, Procurement, Samples, Audits,
 * Batches, Verify results).
 *
 * Conservative, height-agnostic tuning — safe for our variable-height cards
 * (so NO getItemLayout, which would require a fixed row height):
 *   - removeClippedSubviews: detach off-screen rows from the native view tree
 *     (Android only; known to drop content on iOS, so gated by Platform).
 *   - initialNumToRender: fill one screen, defer the rest.
 *   - maxToRenderPerBatch / updateCellsBatchingPeriod: smaller, more frequent
 *     batches → smoother scroll, less jank on a fling.
 *   - windowSize: keep ~5 screens of rows mounted (default is 21 → heavy).
 *
 * Spread last so a screen can still override any single prop:
 *   <FlatList data={...} {...listPerf} />
 */
export const listPerf = {
  removeClippedSubviews: Platform.OS === 'android',
  initialNumToRender: 8,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 11,
} as const;
