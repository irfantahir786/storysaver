
"use client";

import { useEffect, useState } from 'react';
import { fetchSettings } from '@/app/actions';

interface AdSenseUnitProps {
    slot?: string;
    style?: React.CSSProperties;
    format?: string;
    responsive?: string;
}

/**
 * AdSenseUnit - A reusable Google AdSense component.
 * It fetches the Publisher ID from settings and initializes the ad.
 */
export function AdSenseUnit({
    slot,
    style = { display: 'block' },
    format = 'auto',
    responsive = 'true'
}: AdSenseUnitProps) {
    const [pubId, setPubId] = useState<string | null>(null);

    useEffect(() => {
        async function loadConfig() {
            try {
                const data = await fetchSettings();
                
                if (data?.web?.adsense_pub_id?.value) {
                    console.log(data.web.adsense_pub_id.value)
                    setPubId(data.web.adsense_pub_id.value);
                }
            } catch (e) {
                console.error("AdSense config load error", e);
            }
        }
        loadConfig();
    }, []);

    useEffect(() => {
        if (pubId && typeof window !== 'undefined') {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error("AdSense unit initialization error:", err);
            }
        }
    }, [pubId]);

    if (!pubId) return null;

    return (
        <div className="adsense-unit-wrapper w-full overflow-hidden flex justify-center my-4 min-h-[100px] bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={pubId}
                data-ad-slot={slot || "default-slot"}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
}
