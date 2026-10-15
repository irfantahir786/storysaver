
import type { Metadata } from 'next';
import InstaDpViewerPage from '@/components/snapsaver/InstaDpViewerPage';

export const metadata: Metadata = {
  title: 'Instagram DP Viewer | Full Size Profile Picture HD Downloader',
  description: 'View and download any Instagram profile picture in full size and HD quality with our DP viewer. Enter a username to instantly see and save their profile photo.',
  alternates: {
    canonical: '/insta-dp-viewer',
  },
};

export default function DpViewerPage() {
  return <InstaDpViewerPage />;
}
