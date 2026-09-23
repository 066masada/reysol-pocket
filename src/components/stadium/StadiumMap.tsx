import type { Stadium } from '../../types';
import { mapsDirectionsUrl, mapsEmbedUrl, mapsPlaceUrl, openExternal } from '../../utils/external';
import { IconExternal, IconMap } from '../ui/Icons';

interface Props {
  stadium: Stadium;
  showAccess?: boolean;
}

export const StadiumMap = ({ stadium, showAccess = true }: Props) => (
  <div className="card">
    <iframe
      className="map-frame"
      title={`${stadium.name}の地図`}
      src={mapsEmbedUrl(stadium)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
    <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{stadium.name}</div>
        <div className="note">{stadium.address}</div>
      </div>
      {showAccess && stadium.access && (
        <dl className="kv">
          <dt>アクセス</dt><dd>{stadium.access}</dd>
          {stadium.note && (<><dt>備考</dt><dd>{stadium.note}</dd></>)}
        </dl>
      )}
      <div className="cta-grid">
        <button type="button" className="btn btn-sun" onClick={() => openExternal(mapsDirectionsUrl(stadium))}>
          <IconMap />経路を検索
        </button>
        <button type="button" className="btn btn-line" onClick={() => openExternal(mapsPlaceUrl(stadium))}>
          <IconExternal />Googleマップで開く
        </button>
      </div>
    </div>
  </div>
);
