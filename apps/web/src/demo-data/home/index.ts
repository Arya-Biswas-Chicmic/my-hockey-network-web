import groupsData from '@/demo-data/home/groups.json';
import networkData from '@/demo-data/home/network.json';
import type { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { HomeFeedTab } from '@/types/home.types';
import { demoFeedRecords, toFeedPostProps, type DemoFeedViewer } from '@/demo-data/feed';

/** For You's demo posts come from the shared 30-record feed dataset
 * (`@/demo-data/feed`) rather than their own fixture — see that module's
 * header comment. Network/Groups tabs aren't part of this yet and keep
 * their own small fixture files. */
export function getHomeFeedDemoPosts(tab: HomeFeedTab, viewer?: DemoFeedViewer): readonly FeedPostProps[] {
  if (tab === HomeFeedTab.FOR_YOU) return demoFeedRecords.map((record) => toFeedPostProps(record, viewer));
  if (tab === HomeFeedTab.NETWORK) return networkData as FeedPostProps[];
  return groupsData as FeedPostProps[];
}
