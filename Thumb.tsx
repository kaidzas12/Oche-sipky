import type { Listing } from '@/lib/types';
import { thumbSvg } from './thumbSvg';

export default function Thumb({ it }: { it: Listing }) {
  if (it.hasPhoto) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/api/photo/${it.id}`} alt={it.title} loading="lazy" />;
  }
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: thumbSvg(it) }} />;
}
